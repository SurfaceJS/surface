import { assert, contains, dashedToCamel, typeGuard, Indexer }                                  from "@surface/core";
import Enumerable                                                                               from "@surface/enumerable";
import Expression, { IExpression, IIdentifier, IPattern, SyntaxError, TypeGuard }               from "@surface/expression";
import { scapeBrackets, throwTemplateParseError }                                               from "./common";
import directiveRegistry                                                                        from "./directive-registry";
import IAttributeDescriptor                                                                     from "./interfaces/attribute-descriptor";
import IChoiceDirectiveBranch                                                                   from "./interfaces/choice-directive-branch";
import IElementDescriptor                                                                       from "./interfaces/element-descriptor";
import IInjectDirective                                                                         from "./interfaces/inject-directive";
import IInjectorDirective                                                                       from "./interfaces/injector-directive";
import ILoopDirective                                                                           from "./interfaces/loop-directive";
import ITemplateDescriptor                                                                      from "./interfaces/template-descriptor";
import ITextNodeDescriptor                                                                      from "./interfaces/text-node-descriptor";
import { nativeEvents }                                                                         from "./native-events";
import ObserverVisitor                                                                          from "./observer-visitor";
import { parseDestructuredPattern, parseExpression, parseForLoopStatement, parseInterpolation } from "./parsers";
import { interpolation }                                                                        from "./patterns";
import { StackTrace }                                                                           from "./types";

const DECOMPOSED = Symbol("custom-element:decomposed");
const DIRECTIVE  = Symbol("custom-element:directive");

enum DirectiveType
{
    If          = "#if",
    ElseIf      = "#else-if",
    Else        = "#else",
    For         = "#for",
    Inject      = "#inject",
    InjectKey   = "#inject-key",
    Injector    = "#injector",
    InjectorKey = "#injector-key",
}

const directiveTypes = Object.values(DirectiveType);

const errorMessages =
{
    keyExpression:   (name: string, value: string) => `"${name}" in "${name}='${value}'"`,
    valueExpression: (name: string, value: string) => `"${value}" in "${name}='${value}'"`,
};

type Directive  = { key: string, name: string, type: DirectiveType, value: string };

export default class TemplateParser
{
    public static testEnviroment: boolean = false;

    private readonly indexStack: Array<number> = [];
    private readonly name:       string;
    private readonly stackTrace: StackTrace;
    private readonly templateDescriptor: ITemplateDescriptor =
    {
        elements: [],
        directives:
        {
            logical:  [],
            loop:     [],
            inject:   [],
            injector: []
        },
        lookup: []
    };

    private offsetIndex: number = 0;

    public constructor(name: string, stackTrace?: StackTrace)
    {
        this.name = name;

        this.stackTrace = stackTrace ? [...stackTrace] : [[`<${name}>`], ["#shadow-root"]];
    }

    private static internalParse(name: string, template: HTMLTemplateElement, stackTrace: StackTrace): ITemplateDescriptor
    {
        return new TemplateParser(name, stackTrace).parse(template);
    }

    public static parse(name: string, template: HTMLTemplateElement): [HTMLTemplateElement, ITemplateDescriptor]
    {
        const clone      = template.cloneNode(true) as HTMLTemplateElement;
        const descriptor = new TemplateParser(name).parse(clone);

        return [clone, descriptor];
    }

    public static parseReference(name: string, template: HTMLTemplateElement): ITemplateDescriptor
    {
        return new TemplateParser(name).parse(template);
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private decomposeDirectives(element: Element): HTMLTemplateElement & { [DIRECTIVE]?: Directive }
    {
        if (!this.hasDecomposed(element))
        {
            const template = this.elementToTemplate(element);

            const [directive, ...directives] = this.enumerateDirectives(template.attributes);

            template[DIRECTIVE] = directive;

            if (directives.length > 0)
            {
                const innerTemplate = template.cloneNode(false) as HTMLTemplateElement;

                directives.forEach(x => template.removeAttribute(x.name));

                innerTemplate.removeAttribute(directive.name);
                innerTemplate.removeAttribute(directive.name + "-key");

                this.nest(template, innerTemplate);
            }

            return template;
        }
        else
        {
            return element as HTMLTemplateElement;
        }
    }

    private elementToTemplate(element: Element): HTMLTemplateElement & { [DIRECTIVE]?: Directive }
    {
        const isTemplate = element.nodeName == "TEMPLATE";

        if (!isTemplate)
        {
            const template = document.createElement("template");
            const clone    = element.cloneNode(true) as Element;

            for (const attribute of Array.from(clone.attributes).filter(x => directiveTypes.some(directive => x.name.startsWith(directive))))
            {
                clone.attributes.removeNamedItem(attribute.name);
                template.attributes.setNamedItem(attribute);
            }

            template.content.appendChild(clone);

            element.parentNode!.replaceChild(template, element);

            this.setDecomposed(clone);

            return template;
        }

        return element as HTMLTemplateElement;
    }

    private getPath(): string
    {
        return this.indexStack.join("-");
    }

    private nodeToString(node: Node): string;
    private nodeToString(node: (Element|Text)): string
    {
        if (typeGuard<Text>(node, node.nodeType == Node.TEXT_NODE))
        {
            return node.nodeValue ?? "";
        }

        return `<${node.nodeName.toLowerCase()}${node.attributes.length == 0 ? "" : " "}${Array.from(node.attributes).map(x => !x.value ? x.name : `${x.name}="${x.value}"`).join(" ")}>`;
    }

    private hasDecomposed(element: Node & { [DECOMPOSED]?: boolean }): boolean
    {
        return !!element[DECOMPOSED];
    }

    private hasTemplateDirectives(element: Element & { [DIRECTIVE]?: Directive }): boolean
    {
        return element.getAttributeNames().some(attribute => directiveTypes.some(directive => attribute.startsWith(directive)));
    }

    private *enumerateAttributes(element: Element): Iterable<Attr>
    {
        for (const attribute of Array.from(element.attributes))
        {
            if (attribute.name.startsWith("*"))
            {
                const wrapper = document.createAttribute(attribute.name.replace(/^\*/, ""));

                wrapper.value = attribute.value;
                element.removeAttributeNode(attribute);
                element.setAttributeNode(wrapper);

                yield wrapper;
            }
            else if
            (
                attribute.name.startsWith(":")
                || attribute.name.startsWith("#")
                || (interpolation.test(attribute.value) && !(/^on\w/.test(attribute.name) && nativeEvents.includes(attribute.name)))
            )
            {
                yield attribute;
            }
            else
            {
                attribute.value = scapeBrackets(attribute.value);
            }
        }
    }

    private enumerateDirectives(namedNodeMap: NamedNodeMap): Iterable<Directive>;
    private enumerateDirectives(namedNodeMap: NamedNodeMap & Indexer<Attr>): Iterable<Directive>
    {
        const KEYED_DIRECTIVES = [DirectiveType.Inject, DirectiveType.Injector];

        return Enumerable.from(namedNodeMap)
            .where(x => !x.name.endsWith("-key"))
            .select
            (
                attribute =>
                {
                    for (const directive of KEYED_DIRECTIVES)
                    {
                        if (attribute.name == directive || (attribute.name.startsWith(directive + ":")))
                        {
                            const directiveKey = `${directive}-key`;

                            const [type, _key] = attribute.name.split(":") as [DirectiveType, string|undefined];

                            const key = typeof _key == "string"
                                ?`'${_key}'`
                                : `${namedNodeMap[directiveKey]?.value ?? "'default'"}`;

                            return { key, type, name: attribute.name, value: attribute.value };
                        }
                    }

                    return { key: "", type: attribute.name as DirectiveType, name: attribute.name, value: attribute.value };
                }
            );
    }

    private nest(template: HTMLTemplateElement, innerTemplate: HTMLTemplateElement): void
    {
        innerTemplate.content.appendChild(template.content);

        const decomposed = this.decomposeDirectives(innerTemplate);

        this.setDecomposed(decomposed);

        template.content.appendChild(decomposed);
    }

    private parse(template: HTMLTemplateElement): ITemplateDescriptor
    {
        this.traverseNode(template.content);

        return this.templateDescriptor;
    }

    private parseAttributes(element: Element & { [DIRECTIVE]?: Directive }): void
    {
        const elementDescriptor: IElementDescriptor =
        {
            attributes: [],
            directives: [],
            path:       this.indexStack.join("-"),
            textNodes:  [],
        };

        const stackTrace = element.attributes.length > 0 ? [...this.stackTrace] : [];

        for (const attribute of this.enumerateAttributes(element))
        {
            if (attribute.name.startsWith("#"))
            {
                if (!attribute.name.endsWith("-key"))
                {
                    const [rawName, rawKey] = attribute.name.split(":");

                    const name = rawName.replace("#", "");

                    if (!directiveRegistry.has(name))
                    {
                        throwTemplateParseError(`Unregistered directive #${name}.`, this.stackTrace);
                    }

                    const dinamicKey = (element.attributes as NamedNodeMap & Indexer<Attr>)[rawName + "-key"]?.value ?? "'default'";

                    const key = !!rawKey
                        ? Expression.literal(rawKey)
                        : this.tryParseExpression(parseExpression, dinamicKey, errorMessages.keyExpression(attribute.name, attribute.value));

                    const expression       = this.tryParseExpression(parseExpression, attribute.value, errorMessages.valueExpression(attribute.name, attribute.value));
                    const keyObservables   = ObserverVisitor.observe(key);
                    const valueObservables = ObserverVisitor.observe(expression);

                    elementDescriptor.directives.push({ name, key, value: expression, keyObservables, valueObservables, stackTrace });

                    element.removeAttributeNode(attribute);
                }
            }
            else
            {
                const name            = attribute.name.replace(/^::?/, "");
                const key             = dashedToCamel(name);
                const isTwoWay        = attribute.name.startsWith("::");
                const isOneWay        = !isTwoWay && attribute.name.startsWith(":");
                const isInterpolation = !isOneWay && !isTwoWay;

                const type = isOneWay
                    ? "oneway"
                    : isTwoWay
                        ? "twoway"
                        : "interpolation";

                const expression = isInterpolation
                    ? this.tryParseExpression(parseInterpolation, attribute.value, errorMessages.valueExpression(attribute.name, attribute.value))
                    : this.tryParseExpression(parseExpression, attribute.value, errorMessages.valueExpression(attribute.name, attribute.value));

                if (isTwoWay && !this.validateMemberExpression(expression, true))
                {
                    throwTemplateParseError(`Two way data bind cannot be applied to dynamic properties: "${attribute.value}"`, this.stackTrace);
                }

                const observables = !isTwoWay ? ObserverVisitor.observe(expression) : [];

                if (isInterpolation)
                {
                    attribute.value = "";
                }
                else
                {
                    element.removeAttributeNode(attribute);
                }

                const attributeDescriptor: IAttributeDescriptor = { name, key, expression, observables, type, stackTrace };

                elementDescriptor.attributes.push(attributeDescriptor);
            }
        }

        if (elementDescriptor.attributes.length > 0 || elementDescriptor.directives.length > 0)
        {
            this.templateDescriptor.elements.push(elementDescriptor);

            this.saveLookup();
        }
    }

    private parseTemplateDirectives(element: Element): void
    {
        const template = this.decomposeDirectives(element);

        const directive = template[DIRECTIVE]!;

        const stackTrace = [...this.stackTrace];

        /* istanbul ignore else */
        if (directive.type == DirectiveType.If)
        {
            const branches: Array<IChoiceDirectiveBranch> = [];

            const expression = this.tryParseExpression(parseExpression, directive.value, errorMessages.valueExpression(directive.name, directive.value));
            const descriptor = TemplateParser.internalParse(this.name, template, this.stackTrace);

            const conditionalBranchDescriptor: IChoiceDirectiveBranch =
            {
                descriptor,
                expression,
                stackTrace,
                path:        this.getPath(),
                observables: ObserverVisitor.observe(expression),
            };

            branches.push(conditionalBranchDescriptor);

            let nextElementSibling = template.nextElementSibling;

            this.saveLookup();

            const lastIndex = this.indexStack.pop()!;
            const lastStack = this.stackTrace.pop()!;

            const parentChildNodes = Enumerable.from(template.parentNode!.childNodes)
                .skip(lastIndex)
                .take(template.parentNode!.childNodes.length - lastIndex)
                .toArray();

            let index = 0;

            while (nextElementSibling && contains(nextElementSibling.getAttributeNames(), [DirectiveType.ElseIf, DirectiveType.Else]))
            {
                let simblingTemplate = this.decomposeDirectives(nextElementSibling);

                const simblingDirective = simblingTemplate[DIRECTIVE];

                const value = simblingDirective!.type == DirectiveType.Else ? "true" : simblingDirective!.value;

                index = parentChildNodes.indexOf(nextElementSibling);

                const currentIndex = index + lastIndex;

                this.indexStack.push(currentIndex);

                if (!this.hasDecomposed(nextElementSibling))
                {
                    this.pushToStack(nextElementSibling, currentIndex);
                }

                const expression = this.tryParseExpression(parseExpression, value, errorMessages.valueExpression(simblingDirective!.name, simblingDirective!.value));
                const descriptor = TemplateParser.internalParse(this.name, simblingTemplate, this.stackTrace);

                const conditionalBranchDescriptor: IChoiceDirectiveBranch =
                {
                    descriptor,
                    expression,
                    path:        this.getPath(),
                    observables: ObserverVisitor.observe(expression),
                    stackTrace:  [...this.stackTrace]
                };

                branches.push(conditionalBranchDescriptor);

                nextElementSibling = simblingTemplate.nextElementSibling;

                this.saveLookup();

                this.indexStack.pop();
                this.stackTrace.pop();
            }

            this.offsetIndex = index;

            this.indexStack.push(lastIndex);
            this.stackTrace.push(lastStack);

            this.templateDescriptor.directives.logical.push({ branches });
        }
        else if (directive.type == DirectiveType.For)
        {
            const value = directive.value;

            const { left, right, operator } = this.tryParseExpression(parseForLoopStatement, value, errorMessages.valueExpression(directive.name, directive.value));

            const descriptor = TemplateParser.internalParse(this.name, template, this.stackTrace);

            const loopDescriptor: ILoopDirective =
            {
                descriptor,
                left,
                operator,
                right,
                stackTrace,
                observables: ObserverVisitor.observe(right),
                path:        this.getPath(),
            };

            this.templateDescriptor.directives.loop.push(loopDescriptor);

            this.saveLookup();
        }
        else if (directive.type == DirectiveType.Injector)
        {
            const { key, value } = directive;

            const keyExpression = this.tryParseExpression(parseExpression, key, errorMessages.keyExpression(directive.name, directive.value));
            const expression    = this.tryParseExpression(parseExpression, `${value || "({ })"}`, errorMessages.valueExpression(directive.name, directive.value));
            const observables   = ObserverVisitor.observe(expression).concat(ObserverVisitor.observe(keyExpression));
            const descriptor    = TemplateParser.internalParse(this.name, template, this.stackTrace);

            const injectionDescriptor: IInjectorDirective =
            {
                descriptor,
                expression,
                observables,
                stackTrace,
                key:  parseExpression(key),
                path: this.getPath(),
            };

            this.templateDescriptor.directives.injector.push(injectionDescriptor);

            this.saveLookup();
        }
        else if (directive.type == DirectiveType.Inject)
        {
            const { key, value } = directive;

            const destructured = /^\s*\{/.test(value);

            const keyExpression = this.tryParseExpression(parseExpression, key, errorMessages.keyExpression(directive.name, directive.value));
            const pattern       = this.tryParseExpression(destructured ? parseDestructuredPattern : parseExpression, `${value || "__scope__"}`, errorMessages.valueExpression(directive.name, directive.value)) as IPattern|IIdentifier;

            const descriptor = TemplateParser.internalParse(this.name, template, this.stackTrace);

            const injectionDescriptor: IInjectDirective =
            {
                descriptor,
                pattern,
                stackTrace,
                key:  keyExpression,
                path: this.getPath(),
            };

            this.templateDescriptor.directives.inject.push(injectionDescriptor);

            this.saveLookup();
        }

        // istanbul ignore if
        if (!TemplateParser.testEnviroment)
        {
            template.removeAttribute(directive.name);
            template.removeAttribute(directive.name + "-key");
        }
    }

    private parseTextNode(node: Text): void
    {
        assert(node.nodeValue);

        if (interpolation.test(node.nodeValue))
        {
            const rawExpression = node.nodeValue;

            const expression  = this.tryParseExpression(parseInterpolation, rawExpression, `"${rawExpression}"`);
            const observables = ObserverVisitor.observe(expression);
            const path        = this.indexStack.join("-");

            const textNodeDescriptor: ITextNodeDescriptor = { path, expression, observables, stackTrace: [...this.stackTrace] };

            const rawParentPath = this.indexStack.slice(0, this.indexStack.length - 1);
            const parentPath    = rawParentPath.join("-");
            const element       = this.templateDescriptor.elements.find(x => x.path == parentPath);

            if (element)
            {
                element.textNodes.push(textNodeDescriptor);
            }
            else
            {
                this.templateDescriptor.lookup.push([...rawParentPath]);

                this.templateDescriptor.elements.push({ attributes: [], directives: [], path: parentPath, textNodes: [textNodeDescriptor] });
            }

            node.nodeValue = " ";

            this.saveLookup();
        }
        else
        {
            node.nodeValue = scapeBrackets(node.nodeValue);
        }
    }

    private pushToStack(node: Node, index: number): void
    {
        const stackEntry: Array<string> = [];

        if (index > 0)
        {
            stackEntry.push(`...${index} other(s) node(s)`);
        }

        stackEntry.push(this.nodeToString(node));

        this.stackTrace.push(stackEntry);
    }

    private saveLookup(): void
    {
        this.templateDescriptor.lookup.push([...this.indexStack]);
    }

    private setDecomposed(element: Element & { [DECOMPOSED]?: boolean }): void
    {
        element[DECOMPOSED] = true;
    }

    private traverseNode(node: Node): void
    {
        for (let index = 0; index < node.childNodes.length; index++)
        {
            const childNode = node.childNodes[index];

            if ((childNode.nodeType == Node.ELEMENT_NODE || childNode.nodeType == Node.TEXT_NODE) && childNode.nodeName != "SCRIPT" && childNode.nodeName != "STYLE")
            {
                this.indexStack.push(index);

                if (!this.hasDecomposed(childNode))
                {
                    this.pushToStack(childNode, index);
                }

                if (typeGuard<Element>(childNode, childNode.nodeType == Node.ELEMENT_NODE))
                {
                    if (childNode.hasAttribute(DirectiveType.ElseIf))
                    {
                        throwTemplateParseError(`Unexpected ${DirectiveType.ElseIf} directive. ${DirectiveType.ElseIf} must be used in an element next to an element that uses the ${DirectiveType.ElseIf} directive.`, this.stackTrace);
                    }

                    if (childNode.hasAttribute(DirectiveType.Else))
                    {
                        throwTemplateParseError(`Unexpected ${DirectiveType.Else} directive. ${DirectiveType.Else} must be used in an element next to an element that uses the ${DirectiveType.If} or ${DirectiveType.ElseIf} directive.`, this.stackTrace);
                    }

                    if (this.hasTemplateDirectives(childNode))
                    {
                        this.offsetIndex = 0;

                        this.parseTemplateDirectives(childNode);

                        index += this.offsetIndex;

                        this.indexStack.pop();
                        this.stackTrace.pop();

                        continue;
                    }
                    else
                    {
                        this.parseAttributes(childNode);
                    }
                }
                else
                {
                    this.parseTextNode(childNode as Text);
                }

                this.traverseNode(childNode);

                this.indexStack.pop();
                this.stackTrace.pop();
            }
        }
    }

    // tslint:disable-next-line: no-any
    private tryParseExpression<TParser extends (expression: string) => any>(parser: TParser, expression: string, description: string): ReturnType<TParser>
    {
        try
        {
            return parser(expression);
        }
        catch (error)
        {
            assert(error instanceof SyntaxError);

            throwTemplateParseError(`Error parsing ${description}: ${error.message} at position ${error.index}`, this.stackTrace);
        }
    }

    private validateMemberExpression(expression: IExpression, root: boolean): boolean
    {
        if (!root && (TypeGuard.isThisExpression(expression) || TypeGuard.isIdentifier(expression)))
        {
            return true;
        }
        else if (TypeGuard.isMemberExpression(expression) && !expression.optional && (!expression.computed || TypeGuard.isLiteral(expression.property)))
        {
            return this.validateMemberExpression(expression.object, false);
        }

        return false;
    }
}
import { Indexer }                                                                              from "@surface/core";
import { contains }                                                                             from "@surface/core/common/array";
import { assert, typeGuard }                                                                    from "@surface/core/common/generic";
import { dashedToCamel }                                                                        from "@surface/core/common/string";
import Enumerable                                                                               from "@surface/enumerable";
import Expression                                                                               from "@surface/expression";
import IPattern                                                                                 from "@surface/expression/interfaces/pattern";
import Identifier                                                                               from "@surface/expression/internal/expressions/identifier";
import SyntaxError                                                                              from "@surface/expression/syntax-error";
import { scapeBrackets }                                                                        from "./common";
import directiveRegistry                                                                        from "./directive-registry";
import IAttributeDescriptor                                                                     from "./interfaces/attribute-descriptor";
import IChoiceDirectiveBranch                                                                   from "./interfaces/choice-directive-branch";
import IDirectivesDescriptor                                                                    from "./interfaces/directives-descriptor";
import IElementDescriptor                                                                       from "./interfaces/element-descriptor";
import IInjectDirective                                                                         from "./interfaces/inject-directive";
import IInjectorDirective                                                                       from "./interfaces/injector-directive";
import ILoopDirective                                                                           from "./interfaces/loop-directive";
import ITemplateDescriptor                                                                      from "./interfaces/template-descriptor";
import ITextNodeDescriptor                                                                      from "./interfaces/text-node-descriptor";
import InterpolatedExpression                                                                   from "./interpolated-expression";
import { nativeEvents }                                                                         from "./native-events";
import ObserverVisitor                                                                          from "./observer-visitor";
import { parseDestructuredPattern, parseExpression, parseForLoopStatement, parseInterpolation } from "./parsers";
import { interpolation }                                                                        from "./patterns";
import TemplateParseError                                                                       from "./template-parse-error";

const DECOMPOSED     = Symbol("custom-element:decomposed");
const DIRECTIVE      = Symbol("custom-element:directive");
const TEMPLATE_OWNER = Symbol("custom-element:template-owner");

const HASH_ELSE         = "#else";
const HASH_ELSE_IF      = "#else-if";
const HASH_FOR          = "#for";
const HASH_IF           = "#if";
const HASH_INJECT       = "#inject";
const HASH_INJECTOR     = "#injector";
const HASH_INJECT_KEY   = "#inject-key";
const HASH_INJECTOR_KEY = "#injector-key";

const templateDirectives =
[
    HASH_IF,
    HASH_ELSE_IF,
    HASH_ELSE,
    HASH_FOR,
    HASH_INJECT,
    HASH_INJECT_KEY,
    HASH_INJECTOR,
    HASH_INJECTOR_KEY
];

const errorMessages =
{
    keyExpression:   (name: string, value: string) => `"${name}" in "${name}='${value}'"`,
    valueExpression: (name: string, value: string) => `"${value}" in "${name}='${value}'"`,
};

type Directive = { key: string, name: string, type: string, value: string };

export default class TemplateParser
{
    public static testEnviroment: boolean = false;

    private readonly directives: IDirectivesDescriptor     = { logical: [], inject: [], injector: [], loop: [] };
    private readonly elements:   Array<IElementDescriptor> = [];
    private readonly lookup:     Array<Array<number>>      = [];
    private readonly stack:      Array<number>             = [];

    private offsetIndex: number = 0;

    public static parse(template: HTMLTemplateElement): [HTMLTemplateElement, ITemplateDescriptor]
    {
        const clone      = template.cloneNode(true) as HTMLTemplateElement;
        const descriptor = new TemplateParser().parse(clone);

        return [clone, descriptor];
    }

    public static parseReference(template: HTMLTemplateElement): ITemplateDescriptor
    {
        return new TemplateParser().parse(template);
    }

    private buildStack(element: Element): string
    {
        const stack: Array<Array<string>> = [];

        const entry = [this.getTag(element)];

        assert(element.parentNode);

        const index = Array.from(element.parentNode.childNodes).indexOf(element as ChildNode);

        if (index > 0)
        {
            entry.push(`...${index} other(s) node(s)`);
        }

        let parent = element.parentNode.nodeType == Node.DOCUMENT_FRAGMENT_NODE
            ? this.getLooseParent(element.parentNode)
            : element.parentNode;

        stack.push(entry.reverse());

        while (parent)
        {
            const parentEntry = [this.getTag(parent as Element)];

            const index = Array.from(parent.parentNode!.childNodes).indexOf(parent as Node as ChildNode);

            if (index > 0)
            {
                parentEntry.push(`...${index} other(s) node(s)`);
            }

            stack.push(parentEntry.reverse());

            parent = parent.parentNode!.nodeType == Node.DOCUMENT_FRAGMENT_NODE
                ? this.getLooseParent(parent.parentNode!)
                : parent.parentNode;
        }

        return stack.reverse().map((entry, i) => entry.map(value => "   ".repeat(i) + value).join("\n")).join("\n");
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private decomposeDirectives(element: Element): HTMLTemplateElement & { [DIRECTIVE]?: Directive }
    {
        if (!this.hasDecomposed(element))
        {
            const template = this.elementToTemplate(element);

            this.setLooseParent(template.content, template);

            const [directive, ...directives] = this.enumerateDirectives(template.attributes);

            template[DIRECTIVE] = directive;

            if (directives.length > 0)
            {
                const innerTemplate = template.cloneNode(true) as HTMLTemplateElement;

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

            for (const attribute of Array.from(clone.attributes).filter(x => templateDirectives.some(directive => x.name.startsWith(directive))))
            {
                clone.attributes.removeNamedItem(attribute.name);
                template.attributes.setNamedItem(attribute);
            }

            template.content.appendChild(clone);

            element.parentNode!.replaceChild(template, element);

            return template;
        }

        return element as HTMLTemplateElement;
    }

    private getLooseParent(element: Node & { [TEMPLATE_OWNER]?: HTMLTemplateElement }): HTMLTemplateElement|null
    {
        return element[TEMPLATE_OWNER] ?? null;
    }

    private getPath(): string
    {
        return this.stack.join("-");
    }

    private getTag(element: Element & { [DIRECTIVE]?: Directive }): string
    {
        if (element.nodeName == "TEMPLATE" && element[DIRECTIVE])
        {
            const directive = element[DIRECTIVE]!;

            return `${directive.name}='${directive.value}'`;
        }

        return element.outerHTML.replace(element.innerHTML, "").replace(`</${element.nodeName.toLowerCase()}>`, "");
    }

    private hasDecomposed(element: Element & { [DECOMPOSED]?: boolean }): boolean
    {
        return !!element[DECOMPOSED];
    }

    private hasTemplateDirectives(element: Element & { [DIRECTIVE]?: Directive }): boolean
    {
        return element.getAttributeNames().some(attribute => templateDirectives.some(directive => attribute.startsWith(directive)));
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
        const KEYED_DIRECTIVES = [HASH_INJECT, HASH_INJECTOR];

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

                            const [_type, _key] = attribute.name.split(":");

                            const [type, key] = typeof _key == "string"
                                ? [_type, `'${_key}'`]
                                : [_type, `${namedNodeMap[directiveKey]?.value ?? "'default'"}`];

                            return { key, type, name: attribute.name, value: attribute.value };
                        }
                    }

                    return { key: "", type: attribute.name, name: attribute.name, value: attribute.value };
                }
            );
    }

    private nest(template: HTMLTemplateElement, innerTemplate: HTMLTemplateElement): void
    {
        Array.from(template.content.childNodes).forEach(x => x.remove());

        const decomposed = this.decomposeDirectives(innerTemplate);

        this.setDecomposed(decomposed);

        template.content.appendChild(decomposed);
    }

    private parse(template: HTMLTemplateElement): ITemplateDescriptor
    {
        this.traverseNode(template.content);

        return { elements: this.elements, directives: this.directives, lookup: this.lookup };
    }

    private parseAttributes(element: Element & { [DIRECTIVE]?: Directive }): void
    {
        const elementDescriptor: IElementDescriptor = { attributes: [], directives: [], path: this.stack.join("-"), textNodes: [] };

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
                        throw new TemplateParseError(`Unregistered directive #${name}.`, this.buildStack(element));
                    }

                    const dinamicKey = (element.attributes as NamedNodeMap & Indexer<Attr>)[rawName + "-key"]?.value ?? "'default'";

                    const key = !!rawKey
                        ? Expression.literal(rawKey)
                        : this.tryParseExpression(parseExpression, dinamicKey, element, errorMessages.keyExpression(attribute.name, attribute.value));

                    const expression       = this.tryParseExpression(parseExpression, attribute.value, element, errorMessages.valueExpression(attribute.name, attribute.value));
                    const keyObservables   = ObserverVisitor.observe(key);
                    const valueObservables = ObserverVisitor.observe(expression);

                    elementDescriptor.directives.push({ name, key, value: expression, keyObservables, valueObservables });

                    element.removeAttributeNode(attribute);
                }
            }
            else
            {
                const name     = attribute.name.replace(/^::?/, "");
                const key      = dashedToCamel(name);
                const isTwoWay = attribute.name.startsWith("::");
                const isOneWay = !isTwoWay && attribute.name.startsWith(":");

                const type = isOneWay
                    ? "oneway"
                    : isTwoWay
                        ? "twoway"
                        : "interpolation";

                const expression = type == "interpolation"
                    ? this.tryParseExpression(parseInterpolation, attribute.value, element, errorMessages.valueExpression(attribute.name, attribute.value))
                    : type == "twoway"
                        ? Expression.literal(attribute.value)
                        : this.tryParseExpression(parseExpression, attribute.value, element, errorMessages.valueExpression(attribute.name, attribute.value));


                if (isOneWay || isTwoWay)
                {
                    element.removeAttributeNode(attribute);
                }
                else
                {
                    attribute.value = "";
                }

                const observables = ObserverVisitor.observe(expression);

                const attributeDescriptor: IAttributeDescriptor = { name, key, expression, observables, type };

                elementDescriptor.attributes.push(attributeDescriptor);
            }
        }

        if (elementDescriptor.attributes.length > 0 || elementDescriptor.directives.length > 0)
        {
            this.elements.push(elementDescriptor);

            this.saveLookup();
        }
    }

    private parseTemplateDirectives(element: Element): void
    {
        const template = this.decomposeDirectives(element);

        const directive = template[DIRECTIVE]!;

        /* istanbul ignore else */
        if (directive.type == HASH_IF)
        {
            const branches: Array<IChoiceDirectiveBranch> = [];

            const expression = this.tryParseExpression(parseExpression, directive.value, template, errorMessages.valueExpression(directive.name, directive.value));
            const descriptor = TemplateParser.parseReference(template);

            const conditionalBranchDescriptor: IChoiceDirectiveBranch =
            {
                descriptor,
                expression,
                path:        this.getPath(),
                observables: ObserverVisitor.observe(expression),
            };

            branches.push(conditionalBranchDescriptor);

            let nextElementSibling = template.nextElementSibling;

            this.saveLookup();

            const lastIndex = this.stack.pop()!;

            const parentChildNodes = Enumerable.from(template.parentNode!.childNodes)
                .skip(lastIndex)
                .take(template.parentNode!.childNodes.length - lastIndex)
                .toArray();

            let index = 0;

            while (nextElementSibling && contains(nextElementSibling.getAttributeNames(), [HASH_ELSE_IF, HASH_ELSE]))
            {
                let simblingTemplate = this.decomposeDirectives(nextElementSibling);

                const simblingDirective = simblingTemplate[DIRECTIVE];

                const value = simblingDirective!.type == HASH_ELSE ? "true" : simblingDirective!.value;

                index = parentChildNodes.indexOf(nextElementSibling);

                this.stack.push(index + lastIndex);

                const expression = this.tryParseExpression(parseExpression, value, template, errorMessages.valueExpression(simblingDirective!.name, simblingDirective!.value));
                const descriptor = TemplateParser.parseReference(simblingTemplate);

                const conditionalBranchDescriptor: IChoiceDirectiveBranch =
                {
                    descriptor,
                    expression,
                    path:        this.getPath(),
                    observables: ObserverVisitor.observe(expression),
                };

                branches.push(conditionalBranchDescriptor);

                nextElementSibling = simblingTemplate.nextElementSibling;

                this.saveLookup();

                this.stack.pop();
            }

            this.offsetIndex = index;

            this.stack.push(lastIndex);

            this.directives.logical.push({ branches });
        }
        else if (directive.type == HASH_FOR)
        {
            const value = directive.value;

            const { left, right, operator } = this.tryParseExpression(parseForLoopStatement, value, template, errorMessages.valueExpression(directive.name, directive.value));

            const descriptor = TemplateParser.parseReference(template);

            const loopDescriptor: ILoopDirective =
            {
                descriptor,
                left,
                operator,
                right,
                observables: ObserverVisitor.observe(right),
                path:        this.getPath(),
            };

            this.directives.loop.push(loopDescriptor);

            this.saveLookup();
        }
        else if (directive.type == HASH_INJECTOR)
        {
            const { key, value } = directive;

            const keyExpression = this.tryParseExpression(parseExpression, key, template, errorMessages.keyExpression(directive.name, directive.value));
            const expression    = this.tryParseExpression(parseExpression, `${value || "({ })"}`, template, errorMessages.valueExpression(directive.name, directive.value));
            const observables   = ObserverVisitor.observe(expression).concat(ObserverVisitor.observe(keyExpression));
            const descriptor    = TemplateParser.parseReference(template);

            const injectionDescriptor: IInjectorDirective =
            {
                descriptor,
                expression,
                observables,
                key:  parseExpression(key),
                path: this.getPath(),
            };

            this.directives.injector.push(injectionDescriptor);

            this.saveLookup();
        }
        else if (directive.type == HASH_INJECT)
        {
            const { key, value } = directive;

            const destructured = /^\s*\{/.test(value);

            const keyExpression = this.tryParseExpression(parseExpression, key, element, errorMessages.keyExpression(directive.name, directive.value));
            const pattern       = this.tryParseExpression(destructured ? parseDestructuredPattern : parseExpression, `${value || "__scope__"}`, template, errorMessages.valueExpression(directive.name, directive.value)) as IPattern|Identifier;

            const descriptor = TemplateParser.parseReference(template);

            const injectionDescriptor: IInjectDirective =
            {
                descriptor,
                pattern,
                key:  keyExpression,
                path: this.getPath(),
            };

            this.directives.inject.push(injectionDescriptor);

            this.saveLookup();
        }

        // istanbul ignore if
        if (!TemplateParser.testEnviroment)
        {
            template.removeAttribute(directive.name);
            template.removeAttribute(directive.name + "-key");
        }
    }

    private parseTextNode(node: ChildNode): void
    {
        assert(node.nodeValue);

        if (interpolation.test(node.nodeValue))
        {
            const rawExpression = node.nodeValue;

            node.nodeValue = " ";

            const expression  = InterpolatedExpression.parse(rawExpression);
            const observables = ObserverVisitor.observe(expression);
            const path        = this.stack.join("-");

            const textNodeDescriptor: ITextNodeDescriptor = { path, expression, observables };

            const rawParentPath = this.stack.slice(0, this.stack.length - 1);
            const parentPath    = rawParentPath.join("-");
            const element       = this.elements.find(x => x.path == parentPath);

            if (element)
            {
                element.textNodes.push(textNodeDescriptor);
            }
            else
            {
                this.lookup.push([...rawParentPath]);

                this.elements.push({ attributes: [], directives: [], path: parentPath, textNodes: [textNodeDescriptor] });
            }

            this.saveLookup();
        }
        else
        {
            node.nodeValue = scapeBrackets(node.nodeValue);
        }
    }

    private saveLookup(): void
    {
        this.lookup.push([...this.stack]);
    }

    private setDecomposed(element: Element & { [DECOMPOSED]?: boolean }): void
    {
        element[DECOMPOSED] = true;
    }

    private setLooseParent(element: Node & { [TEMPLATE_OWNER]?: HTMLTemplateElement }, template: HTMLTemplateElement): void
    {
        element[TEMPLATE_OWNER] = template;
    }

    private traverseNode(node: Node): void
    {
        for (let index = 0; index < node.childNodes.length; index++)
        {
            const childNode = node.childNodes[index];

            if ((childNode.nodeType == Node.ELEMENT_NODE || childNode.nodeType == Node.TEXT_NODE) && childNode.nodeName != "SCRIPT" && childNode.nodeName != "STYLE")
            {
                this.stack.push(index);

                if (typeGuard<Element>(childNode, childNode.nodeType == Node.ELEMENT_NODE))
                {
                    if (childNode.hasAttribute(HASH_ELSE_IF))
                    {
                        throw new TemplateParseError(`Unexpected ${HASH_ELSE_IF} directive. ${HASH_ELSE_IF} must be used in an element next to an element that uses the ${HASH_ELSE_IF} directive.`, this.buildStack(childNode));
                    }

                    if (childNode.hasAttribute(HASH_ELSE))
                    {
                        throw new TemplateParseError(`Unexpected ${HASH_ELSE} directive. ${HASH_ELSE} must be used in an element next to an element that uses the ${HASH_IF} or ${HASH_ELSE_IF} directive.`, this.buildStack(childNode));
                    }

                    if (this.hasTemplateDirectives(childNode))
                    {
                        this.offsetIndex = 0;

                        this.parseTemplateDirectives(childNode);

                        index += this.offsetIndex;

                        this.stack.pop();

                        continue;
                    }
                    else
                    {
                        this.parseAttributes(childNode);
                    }
                }
                else
                {
                    this.parseTextNode(childNode);
                }

                this.traverseNode(childNode);

                this.stack.pop();
            }
        }
    }

    // tslint:disable-next-line: no-any
    private tryParseExpression<TParser extends (expression: string) => any>(parser: TParser, expression: string, element: Element, description: string): ReturnType<TParser>
    {
        try
        {
            return parser(expression);
        }
        catch (error)
        {
            assert(error instanceof SyntaxError);

            throw new TemplateParseError(`Error parsing ${description}: ${error.message} at position ${error.index}`, this.buildStack(element));
        }
    }
}
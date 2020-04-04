import { contains }                                      from "@surface/core/common/array";
import { assert, typeGuard }                             from "@surface/core/common/generic";
import { dashedToCamel }                                 from "@surface/core/common/string";
import Expression                                        from "@surface/expression";
import IArrowFunctionExpression                          from "@surface/expression/interfaces/arrow-function-expression";
import { enumerateExpresssionAttributes, scapeBrackets } from "./common";
import directiveRegistry                                 from "./directive-registry";
import IAttributeDescriptor                              from "./interfaces/attribute-descriptor";
import IChoiceDirectiveBranch                            from "./interfaces/choice-directive-branch";
import IDirectivesDescriptor                             from "./interfaces/directives-descriptor";
import IElementDescriptor                                from "./interfaces/element-descriptor";
import IInjectDirective                                  from "./interfaces/inject-directive";
import IInjectorDirective                                from "./interfaces/injector-directive";
import ILoopDirective                                    from "./interfaces/loop-directive";
import ITemplateDescriptor                               from "./interfaces/template-descriptor";
import ITextNodeDescriptor                               from "./interfaces/text-node-descriptor";
import InterpolatedExpression                            from "./interpolated-expression";
import parse                                             from "./parse";
import { dinamicKey, forExpression, interpolation }      from "./patterns";

const DECOMPOSED = Symbol("custom-element:decomposed");
const DIRECTIVE  = Symbol("custom-element:directive");

const HASH_ELSE     = "#else";
const HASH_ELSE_IF  = "#else-if";
const HASH_FOR      = "#for";
const HASH_IF       = "#if";
const HASH_INJECT   = "#inject";
const HASH_INJECTOR = "#injector";

const templateDirectives = [HASH_IF, HASH_ELSE_IF, HASH_ELSE, HASH_FOR, HASH_INJECT, HASH_INJECTOR];

// type DirectivesMap = Partial<Record<"inject"|"injector"|"if"|"elseIf"|"else"|"for", KeyValue>>;
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

    // tslint:disable-next-line:cyclomatic-complexity
    private decomposeDirectives(element: Element): HTMLTemplateElement & { [DIRECTIVE]?: Directive }
    {
        if (!this.hasDecomposed(element))
        {
            const template = this.elementToTemplate(element);

            const [directive, ...directives] = this.enumerateDirectives(template.attributes);

            template[DIRECTIVE] = directive;

            // istanbul ignore if
            if (!TemplateParser.testEnviroment)
            {
                template.removeAttribute(directive.name);
            }

            if (directives.length > 0)
            {
                const innerTemplate = template.cloneNode(true) as HTMLTemplateElement;

                directives.forEach(x => template.removeAttribute(x.name));

                innerTemplate.removeAttribute(directive.name);

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

            for (const attribute of Array.from(clone.attributes).filter(x => x.name.startsWith("#")))
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

    private getPath(): string
    {
        return this.stack.join("-");
    }

    private hasDecomposed(element: Element & { [DECOMPOSED]?: boolean }): boolean
    {
        return !!element[DECOMPOSED];
    }

    private hasTemplateDirectives(element: Element & { [DIRECTIVE]?: Directive }): boolean
    {
        return element.getAttributeNames().some(attribute => templateDirectives.findIndex(directive => attribute.startsWith(directive)) > -1);
    }

    private enumerateDirectives(attributes: NamedNodeMap): Array<Directive>
    {
        return Array.from(attributes).map
        (
            attribute =>
            {
                const [type, key] = attribute.name.split(":");

                return { key, type, name: attribute.name, value: attribute.value };
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

        for (const attribute of enumerateExpresssionAttributes(element))
        {
            if (attribute.name.startsWith("#"))
            {
                const [rawName, rawKey = ""] = attribute.name.split(":");

                const name = rawName.replace("#", "");

                if (!directiveRegistry.has(name))
                {
                    throw new Error(`Unregistered directive #${name}.`);
                }

                const key        = dinamicKey.test(rawKey) ? parse(dinamicKey.exec(rawKey)![1]) : Expression.literal(rawKey);
                const expression = parse(attribute.value);

                elementDescriptor.directives.push({ name, key, expression });

                element.removeAttributeNode(attribute);

            }
            else
            {
                const name     = attribute.name.replace(/^(on)?::?/, "");
                const key      = dashedToCamel(name);
                const isTwoWay = attribute.name.startsWith("::");
                const isOneWay = !isTwoWay && attribute.name.startsWith(":");

                const type = isOneWay
                    ? "oneway"
                    : isTwoWay
                        ? "twoway"
                        : "interpolation";

                const expression = type == "interpolation"
                    ? InterpolatedExpression.parse(attribute.value)
                    : type == "twoway"
                        ? Expression.literal(attribute.value)
                        : parse(attribute.value);

                if (isOneWay || isTwoWay)
                {
                    element.removeAttributeNode(attribute);
                }
                else
                {
                    attribute.value = "";
                }

                const attributeDescriptor: IAttributeDescriptor = { name: name, key, expression, type };

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

            const descriptor = TemplateParser.parseReference(template);

            const conditionalBranchDescriptor: IChoiceDirectiveBranch =
            {
                descriptor,
                expression: parse(directive.value),
                path:       this.getPath(),
            };

            branches.push(conditionalBranchDescriptor);

            let nextElementSibling = template.nextElementSibling;

            this.saveLookup();

            const lastIndex = this.stack.pop()!;

            const parentChildNodes = Array.from(template.parentNode!.childNodes).slice(lastIndex, template.parentNode!.childNodes.length);

            let index = 0;

            while (nextElementSibling && contains(nextElementSibling.getAttributeNames(), [HASH_ELSE_IF, HASH_ELSE]))
            {
                let simblingTemplate = this.decomposeDirectives(nextElementSibling);

                const simblingDirective = simblingTemplate[DIRECTIVE];

                const value = simblingDirective!.type == HASH_ELSE ? "true" : simblingDirective!.value;

                index = parentChildNodes.indexOf(nextElementSibling) + lastIndex;

                this.stack.push(index);

                const descriptor = TemplateParser.parseReference(simblingTemplate);

                const conditionalBranchDescriptor: IChoiceDirectiveBranch =
                {
                    descriptor: descriptor,
                    expression: parse(value),
                    path:       this.getPath(),
                };

                branches.push(conditionalBranchDescriptor);

                nextElementSibling = simblingTemplate.nextElementSibling;

                this.saveLookup();

                this.stack.pop();
            }

            this.offsetIndex = index - lastIndex;

            this.stack.push(lastIndex);

            this.directives.logical.push({ branches });
        }
        else if (directive.type == HASH_FOR)
        {
            const value = directive.value;

            if (!forExpression.test(value))
            {
                throw new Error(`Invalid ${HASH_FOR} directive expression: ${value}.`);
            }

            const [, aliasExpression, operator, iterableExpression] = forExpression.exec(value)!.map(x => x.trim()) as [string, string, "in"|"of", string];

            const destructured = aliasExpression.startsWith("[") || aliasExpression.startsWith("{");

            const alias = destructured
                ? (parse(`(${aliasExpression}) => 0`) as IArrowFunctionExpression).parameters[0]
                : aliasExpression;

            const descriptor = TemplateParser.parseReference(template);

            const loopDescriptor: ILoopDirective =
            {
                alias,
                descriptor,
                destructured,
                operator,
                expression: parse(iterableExpression),
                path:       this.getPath(),
            };

            this.directives.loop.push(loopDescriptor);

            this.saveLookup();
        }
        else if (directive.type == HASH_INJECTOR)
        {
            const { key, value } = directive;

            const descriptor = TemplateParser.parseReference(template);

            const injectionDescriptor: IInjectorDirective =
            {
                descriptor,
                expression: parse(`(${value || "{}"})`),
                key:        dinamicKey.test(key) ? parse(dinamicKey.exec(key)![1]) : Expression.literal(key),
                path:       this.getPath()
            };

            this.directives.injector.push(injectionDescriptor);

            this.saveLookup();
        }
        else if (directive.type == HASH_INJECT)
        {
            const { key, value } = directive;

            const descriptor = TemplateParser.parseReference(template);

            const injectionDescriptor: IInjectDirective =
            {
                descriptor,
                destructured: value.startsWith("{"),
                key:          dinamicKey.test(key) ? parse(dinamicKey.exec(key)![1]) : Expression.literal(key),
                path:         this.getPath(),
                pattern:      (parse(`(${value}) => 0`) as IArrowFunctionExpression).parameters[0],
            };

            this.directives.inject.push(injectionDescriptor);

            this.saveLookup();
        }
    }

    private parseTextNode(node: ChildNode): void
    {
        assert(node.nodeValue);

        if (interpolation.test(node.nodeValue))
        {
            const rawExpression = node.nodeValue;

            node.nodeValue = " ";

            const expression = InterpolatedExpression.parse(rawExpression);

            const path = this.stack.join("-");

            const textNodeDescriptor: ITextNodeDescriptor = { path, expression };

            const rawParentPath = this.stack.slice(0, this.stack.length - 1);

            const parentPath = rawParentPath.join("-");

            const element = this.elements.find(x => x.path == parentPath);

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
                        throw new Error(`Unexpected ${HASH_ELSE_IF} directive. ${HASH_ELSE_IF} must be used in an element next to an element that uses the ${HASH_ELSE_IF} directive.`);
                    }

                    if (childNode.hasAttribute(HASH_ELSE))
                    {
                        throw new Error(`Unexpected ${HASH_ELSE} directive. ${HASH_ELSE} must be used in an element next to an element that uses the ${HASH_IF} or ${HASH_ELSE_IF} directive.`);
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
}
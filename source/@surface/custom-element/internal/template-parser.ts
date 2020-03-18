import { contains }                                      from "@surface/core/common/array";
import { assert, typeGuard }                             from "@surface/core/common/generic";
import { dashedToCamel }                                 from "@surface/core/common/string";
import Expression                                        from "@surface/expression";
import IArrowFunctionExpression                          from "@surface/expression/interfaces/arrow-function-expression";
import { enumerateExpresssionAttributes, scapeBrackets } from "./common";
import IAttributeDescriptor                              from "./interfaces/attribute-descriptor";
import IDirectivesDescriptor                             from "./interfaces/directives-descriptor";
import IElementDescriptor                                from "./interfaces/element-descriptor";
import IForStatement                                     from "./interfaces/for-statement";
import IInjectorStatement                                from "./interfaces/injector-statement";
import ITemplateDescriptor                               from "./interfaces/template-descriptor";
import ITextNodeDescriptor                               from "./interfaces/text-node-descriptor";
import IIfStatementBranch                                from "./interfaces/If-branch-statement";
import InterpolatedExpression                            from "./interpolated-expression";
import parse                                             from "./parse";
import { dinamicKey, forExpression, interpolation }      from "./patterns";

const DECOMPOSED = Symbol("custom-element:decomposed");

const HASH_ELSE     = "#else";
const HASH_ELSE_IF  = "#else-if";
const HASH_FOR      = "#for";
const HASH_IF       = "#if";
const HASH_INJECT   = "#inject";
const HASH_INJECTOR = "#injector";

type DirectivesMap = Partial<Record<"inject"|"injector"|"if"|"elseIf"|"else"|"for", KeyValue>>;
type KeyValue      = { key: string, value: string };

export default class TemplateParser
{
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
    private decomposeDirectives(element: Element): HTMLTemplateElement
    {
        if (!this.hasDecomposed(element))
        {
            const template = this.elementToTemplate(element);

            const directives = this.mapDirectives(template.attributes);

            if ((directives.if || directives.elseIf || directives.else) && (directives.for || directives.inject || directives.injector))
            {
                const innerTemplate = template.cloneNode(true) as HTMLTemplateElement;

                template.removeAttribute(HASH_FOR);

                if (directives.inject)
                {
                    template.removeAttribute("#inject:" + directives.inject.key);
                }

                if (directives.injector)
                {
                    template.removeAttribute("#injector:" + directives.injector.key);
                }

                innerTemplate.removeAttribute(HASH_IF);
                innerTemplate.removeAttribute(HASH_ELSE_IF);
                innerTemplate.removeAttribute(HASH_ELSE);

                this.nest(template, innerTemplate);
            }
            else if (directives.for && (directives.inject || directives.injector))
            {
                const innerTemplate = template.cloneNode(true) as HTMLTemplateElement;

                if (directives.inject)
                {
                    template.removeAttribute("#inject:" + directives.inject.key);
                }

                if (directives.injector)
                {
                    template.removeAttribute("#injector:" + directives.injector.key);
                }

                innerTemplate.removeAttribute(HASH_FOR);

                this.nest(template, innerTemplate);
            }
            else if (directives.injector && directives.inject)
            {
                const innerTemplate = template.cloneNode(true) as HTMLTemplateElement;

                template.removeAttribute("#inject:" + directives.inject.key);

                innerTemplate.removeAttribute("#injector:" + directives.injector.key);

                this.nest(template, innerTemplate);
            }

            return template;
        }
        else
        {
            return element as HTMLTemplateElement;
        }
    }

    private elementToTemplate(element: Element): HTMLTemplateElement
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

    private hasDirectives(attributes: Array<string>): boolean
    {
        return attributes.some
        (
            x => x == HASH_IF
            || x == HASH_ELSE
            || x == HASH_ELSE
            || x == HASH_FOR
            || x.startsWith(HASH_INJECT)
            || x.startsWith(HASH_INJECTOR)
        );
    }

    private mapDirectives(attributes: NamedNodeMap): DirectivesMap
    {
        const map: DirectivesMap = { };

        for (const attribute of Array.from(attributes))
        {
            if (attribute.name.startsWith(HASH_INJECT + ":"))
            {
                map["inject"] = { key: attribute.name.split(":")[1], value: attribute.value };
            }
            else if (attribute.name.startsWith(HASH_INJECTOR + ":"))
            {
                map["injector"] = { key: attribute.name.split(":")[1], value: attribute.value };
            }
            else if (attribute.name == "#if")
            {
                map["if"] = { key: attribute.name, value: attribute.value };
            }
            else if (attribute.name == "#else-if")
            {
                map["elseIf"] = { key: attribute.name, value: attribute.value };
            }
            else if (attribute.name == "#else")
            {
                map["else"] = { key: attribute.name, value: "true" };
            }
            else if (attribute.name == "#for")
            {
                map["for"] = { key: attribute.name, value: attribute.value };
            }
        }

        return map;
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

    private parseAttributes(element: Element): void
    {
        const elementDescriptor: IElementDescriptor = { attributes: [], path: this.stack.join("-"), textNodes: [] };

        for (const attribute of enumerateExpresssionAttributes(element))
        {
            const name     = attribute.name.replace(/^(on)?::?/, "");
            const key      = dashedToCamel(name);
            const isEvent  = attribute.name.startsWith("on:");
            const isTwoWay = attribute.name.startsWith("::");
            const isOneWay = !isTwoWay && attribute.name.startsWith(":");

            const type = isOneWay
                ? "oneway"
                : isTwoWay
                    ? "twoway"
                    : isEvent
                        ? "event"
                        : "interpolation";

            const expression = type == "interpolation"
                ? InterpolatedExpression.parse(attribute.value)
                : type == "twoway"
                    ? Expression.literal(attribute.value)
                    : parse(attribute.value);

            if (isEvent || isOneWay || isTwoWay)
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

        this.elements.push(elementDescriptor);

        this.saveLookup();
    }

    private parseDirectives(element: Element): void
    {
        const template = this.decomposeDirectives(element);

        const directives = this.mapDirectives(template.attributes);

        /* istanbul ignore else */
        if (directives.if)
        {
            const branches: Array<IIfStatementBranch> = [];

            const descriptor = TemplateParser.parseReference(template);

            const conditionalBranchDescriptor: IIfStatementBranch =
            {
                descriptor,
                expression: parse(directives.if.value),
                path:       this.getPath(),
            };

            branches.push(conditionalBranchDescriptor);

            let nextElementSibling = template.nextElementSibling;

            template.removeAttribute(HASH_IF);

            this.saveLookup();

            const lastIndex = this.stack.pop()!;

            const parentChildNodes = Array.from(template.parentNode!.childNodes).slice(lastIndex, template.parentNode!.childNodes.length);

            let index = 0;

            while (nextElementSibling && contains(nextElementSibling.getAttributeNames(), [HASH_ELSE_IF, HASH_ELSE]))
            {
                let simblingTemplate     = this.decomposeDirectives(nextElementSibling);
                const simblingDirectives = this.mapDirectives(simblingTemplate.attributes);

                const { value } = simblingDirectives.elseIf ?? simblingDirectives.else as KeyValue;

                index = parentChildNodes.indexOf(nextElementSibling) + lastIndex;

                this.stack.push(index);

                const descriptor = TemplateParser.parseReference(simblingTemplate);

                const conditionalBranchDescriptor: IIfStatementBranch =
                {
                    descriptor: descriptor,
                    expression: parse(value),
                    path:       this.getPath(),
                };

                branches.push(conditionalBranchDescriptor);

                simblingTemplate.removeAttribute(HASH_ELSE_IF);
                simblingTemplate.removeAttribute(HASH_ELSE);

                nextElementSibling = simblingTemplate.nextElementSibling;

                this.saveLookup();

                this.stack.pop();
            }

            this.offsetIndex = index - lastIndex;

            this.stack.push(lastIndex);

            this.directives.logical.push({ branches });
        }
        else if (directives.for)
        {
            const value = directives.for.value;

            if (!forExpression.test(value))
            {
                throw new Error(`Invalid ${HASH_FOR} directive expression: ${value}`);
            }

            const [, aliasExpression, operator, iterableExpression] = forExpression.exec(value)!.map(x => x.trim()) as [string, string, "in"|"of", string];

            const destructured = aliasExpression.startsWith("[") || aliasExpression.startsWith("{");

            const alias = destructured
                ? (parse(`(${aliasExpression}) => 0`) as IArrowFunctionExpression).parameters[0]
                : aliasExpression;

            const descriptor = TemplateParser.parseReference(template);

            const loopDescriptor: IForStatement =
            {
                alias,
                descriptor,
                destructured,
                operator,
                expression: parse(iterableExpression),
                path:       this.getPath(),
            };

            this.directives.loop.push(loopDescriptor);

            template.removeAttribute(HASH_FOR);

            this.saveLookup();
        }
        else if (directives.injector)
        {
            const { key, value } = directives.injector;

            const descriptor = TemplateParser.parseReference(template);

            const injectionDescriptor: IInjectorStatement =
            {
                descriptor,
                expression: parse(`(${value || "{}"})`),
                key:        dinamicKey.test(key) ? parse(dinamicKey.exec(key)![1]) : key,
                path:       this.getPath()
            };

            this.directives.injector.push(injectionDescriptor);

            template.removeAttribute(HASH_INJECTOR + ":" + key);

            this.saveLookup();
        }
        // else if (directives.inject)
        // {
            // const { key, value } = directives.inject;

            // const descriptor = TemplateParser.parseReference(template);

            // const injectionDescriptor: IInjectStatement =
            // {
            //     descriptor,
            //     pattern:    (parse(`(${value}) => 0`) as IArrowFunctionExpression).parameters[0],
            //     key:        dinamicKey.test(key) ? parse(dinamicKey.exec(key)![1]) : key,
            //     path:       this.getPath()
            // };

            // this.directives.inject.push(injectionDescriptor);

            // template.removeAttribute(HASH_INJECT + ":" + directives.inject.key);

            // this.saveLookup();
        // }
    }

    private parseTextNode(element: ChildNode): void
    {
        assert(element.nodeValue);

        if (interpolation.test(element.nodeValue))
        {
            const rawExpression = element.nodeValue;

            element.nodeValue = " ";

            const expression = InterpolatedExpression.parse(rawExpression);

            const path = this.stack.join("-");

            const textNodeDescriptor: ITextNodeDescriptor = { path, expression };

            const relatives = this.elements.filter(x => path.startsWith(x.path));

            if (relatives.length > 0)
            {
                relatives[relatives.length - 1].textNodes.push(textNodeDescriptor);

            }
            else
            {
                const parentPath = this.stack.slice(0, this.stack.length - 1);

                this.lookup.push([...parentPath]);

                this.elements.push({ attributes: [], path: parentPath.join("-"), textNodes: [textNodeDescriptor] });
            }

            this.saveLookup();
        }
        else
        {
            element.nodeValue = scapeBrackets(element.nodeValue);
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
                    if (this.hasDirectives(childNode.getAttributeNames()))
                    {
                        this.offsetIndex = 0;

                        this.parseDirectives(childNode);

                        index += this.offsetIndex;

                        this.stack.pop();

                        continue;
                    }
                    else if (childNode.attributes.length > 0)
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
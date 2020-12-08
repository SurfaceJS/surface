/* eslint-disable max-lines-per-function */
/* eslint-disable max-statements */
/* eslint-disable @typescript-eslint/indent */

import type { Indexer }                                                                         from "@surface/core";
import { assert, contains, dashedToCamel, typeGuard }                                           from "@surface/core";
import Enumerable                                                                               from "@surface/enumerable";
import type { IExpression, IIdentifier, IPattern }                                              from "@surface/expression";
import Expression, { SyntaxError, TypeGuard }                                                   from "@surface/expression";
import { scapeBrackets, throwTemplateParseError }                                               from "../common.js";
import type IAttributeDirective                                                                 from "../interfaces/attribute-directive";
import type IChoiceBranchDirective                                                              from "../interfaces/choice-branch-directive";
import type ICustomDirective                                                                    from "../interfaces/custom-directive";
import type IElementDescriptor                                                                  from "../interfaces/element-descriptor";
import type IEventDirective                                                                     from "../interfaces/event-directive";
import type IInjectDirective                                                                    from "../interfaces/inject-directive";
import type ILoopDirective                                                                      from "../interfaces/loop-directive";
import type IPlaceholderDirective                                                               from "../interfaces/placeholder-directive";
import type ITemplateDescriptor                                                                 from "../interfaces/template-descriptor";
import type ITextNodeDescriptor                                                                 from "../interfaces/text-node-descriptor";
import ObserverVisitor                                                                          from "../reactivity/observer-visitor.js";
import type { StackTrace }                                                                      from "../types";
import { parseDestructuredPattern, parseExpression, parseForLoopStatement, parseInterpolation } from "./expression-parsers.js";
import nativeEvents                                                                             from "./native-events.js";
import { interpolation }                                                                        from "./patterns.js";

const DECOMPOSED = Symbol("custom-element:decomposed");
const DIRECTIVE  = Symbol("custom-element:directive");

enum DirectiveType
{
    If             = "#if",
    ElseIf         = "#else-if",
    Else           = "#else",
    For            = "#for",
    Inject         = "#inject",
    InjectKey      = "#inject-key",
    Placeholder    = "#placeholder",
    PlaceholderKey = "#placeholder-key",
}

const directiveTypes = Object.values(DirectiveType);

type Directive  =
{
    key:    string,
    name:   string,
    raw:    string,
    rawKey: string,
    type:   DirectiveType,
    value:  string,
};

export default class TemplateParser
{
    public static testEnviroment: boolean = false;

    private readonly indexStack: number[] = [];
    private readonly name:       string;
    private readonly stackTrace: StackTrace;
    private readonly templateDescriptor: ITemplateDescriptor =
    {
        directives:
        {
            injections:   [],
            logicals:     [],
            loops:        [],
            placeholders: [],
        },
        elements: [],
        lookup:   [],
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

    public static parse(name: string, template: string): [HTMLTemplateElement, ITemplateDescriptor]
    {
        const templateElement = document.createElement("template");
        templateElement.innerHTML = template;

        const descriptor = new TemplateParser(name).parse(templateElement);

        return [templateElement, descriptor];
    }

    public static parseReference(name: string, template: HTMLTemplateElement): ITemplateDescriptor
    {
        return new TemplateParser(name).parse(template);
    }

    private attributeToString(attribute: Attr): string
    {
        return !attribute.value ? attribute.name : `${attribute.name}="${attribute.value}"`;
    }

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
                innerTemplate.removeAttribute(`${directive.name}-key`);

                this.nest(template, innerTemplate);
            }

            return template;
        }

        return element as HTMLTemplateElement;
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
    private nodeToString(node: (Element | Text)): string
    {
        if (typeGuard<Text>(node, node.nodeType == Node.TEXT_NODE))
        {
            return node.nodeValue ?? "";
        }

        const attributes = Array.from(node.attributes)
            .map(this.attributeToString)
            .join(" ");

        return `<${node.nodeName.toLowerCase()}${node.attributes.length == 0 ? "" : " "}${attributes}>`;
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
                || attribute.name.startsWith("@")
                || attribute.name.startsWith("#")
                || interpolation.test(attribute.value) && !(/^on\w/.test(attribute.name) && nativeEvents.has(attribute.name))
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
        const KEYED_DIRECTIVES = [DirectiveType.Inject, DirectiveType.Placeholder];

        return Enumerable.from(namedNodeMap)
            .where(x => !x.name.endsWith("-key"))
            .select
            (
                attribute =>
                {
                    const raw = this.attributeToString(attribute);

                    for (const directive of KEYED_DIRECTIVES)
                    {
                        if (attribute.name == directive || attribute.name.startsWith(`${directive}:`))
                        {
                            const DEFAULT_KEY = "'default'";

                            const directiveKey = `${directive}-key`;

                            const [type, _key] = attribute.name.split(":") as [DirectiveType, string | undefined];

                            const hasStaticKey = typeof _key == "string";

                            const key = hasStaticKey
                                ? `'${_key}'`
                                : `${namedNodeMap[directiveKey]?.value ?? DEFAULT_KEY}`;

                            const rawKey = !hasStaticKey && key != DEFAULT_KEY ? `${directiveKey}=\"${key}\"` : "";

                            return {
                                key,
                                name:  attribute.name,
                                raw,
                                rawKey,
                                type,
                                value: attribute.value,
                            };
                        }
                    }

                    return {
                        key:    "",
                        name:   attribute.name,
                        raw,
                        rawKey: "",
                        type:   attribute.name as DirectiveType,
                        value:  attribute.value,
                    };
                },
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
        this.trimContent(template.content);

        this.traverseNode(template.content);

        return this.templateDescriptor;
    }

    private parseAttributes(element: Element & { [DIRECTIVE]?: Directive }): void
    {
        const elementDescriptor: IElementDescriptor =
        {
            attributes: [],
            directives: [],
            events:     [],
            path:       this.indexStack.join("-"),
            textNodes:  [],
        };

        const stackTrace = element.attributes.length > 0 ? [...this.stackTrace] : [];

        for (const attribute of this.enumerateAttributes(element))
        {
            if (attribute.name.startsWith("@"))
            {
                const name           = attribute.name.replace("@", "");
                const rawExpression = `${attribute.name}=\"${attribute.value}\"`;
                const expression     = this.tryParseExpression(parseExpression, attribute.value || "undefined", rawExpression);
                const observables    = ObserverVisitor.observe(expression);

                const descriptor: IEventDirective =
                {
                    expression,
                    name,
                    observables,
                    rawExpression,
                    stackTrace,
                };

                elementDescriptor.events.push(descriptor);

                element.removeAttributeNode(attribute);
            }
            else if (attribute.name.startsWith("#"))
            {
                if (!attribute.name.endsWith("-key"))
                {
                    const DEFAULT_KEY       = "'default'";
                    const [rawName, rawKey] = attribute.name.split(":");
                    const name              = rawName.replace("#", "");
                    const rawKeyName        = `${rawName}-key`;

                    const dinamicKey       = (element.attributes as NamedNodeMap & Indexer<Attr>)[rawKeyName]?.value ?? DEFAULT_KEY;
                    const rawKeyExpression = dinamicKey != DEFAULT_KEY ? `${rawKeyName}=\"${dinamicKey}\"` : "";
                    const rawExpression    = `${attribute.name}=\"${attribute.value}\"`;

                    const keyExpression = !!rawKey
                        ? Expression.literal(rawKey)
                        : this.tryParseExpression(parseExpression, dinamicKey, rawKeyExpression);

                    const expression     = this.tryParseExpression(parseExpression, attribute.value || "undefined", rawExpression);
                    const keyObservables = ObserverVisitor.observe(keyExpression);
                    const observables    = ObserverVisitor.observe(expression);

                    const descriptor: ICustomDirective =
                    {
                        expression,
                        keyExpression,
                        keyObservables,
                        name,
                        observables,
                        rawExpression,
                        rawKeyExpression,
                        stackTrace,
                    };

                    elementDescriptor.directives.push(descriptor);

                    element.removeAttributeNode(attribute);
                }
            }
            else
            {
                const raw             = this.attributeToString(attribute);
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

                const expression = this.tryParseExpression(isInterpolation ? parseInterpolation : parseExpression, attribute.value, raw);

                if (isTwoWay && !this.validateMemberExpression(expression, true))
                {
                    throwTemplateParseError(`Two way data bind cannot be applied to dynamic properties: "${attribute.value}"`, this.stackTrace);
                }

                const observables = ObserverVisitor.observe(expression);

                if (isInterpolation)
                {
                    attribute.value = "";
                }
                else
                {
                    element.removeAttributeNode(attribute);
                }

                const attributeDescriptor: IAttributeDirective =
                {
                    expression,
                    key,
                    name,
                    observables,
                    rawExpression: raw,
                    stackTrace,
                    type,
                };

                elementDescriptor.attributes.push(attributeDescriptor);
            }
        }

        if (elementDescriptor.attributes.length + elementDescriptor.directives.length + elementDescriptor.events.length > 0)
        {
            this.templateDescriptor.elements.push(elementDescriptor);

            this.saveLookup();
        }
    }

    private parseTemplateDirectives(element: Element, nonElementsCount: number): void
    {
        const template = this.decomposeDirectives(element);

        const directive = template[DIRECTIVE]!;

        const stackTrace = [...this.stackTrace];

        /* istanbul ignore else */
        if (directive.type == DirectiveType.If)
        {
            const branches: IChoiceBranchDirective[] = [];

            const expression = this.tryParseExpression(parseExpression, directive.value, directive.raw);
            const descriptor = TemplateParser.internalParse(this.name, template, this.stackTrace);

            const conditionalBranchDescriptor: IChoiceBranchDirective =
            {
                descriptor,
                expression,
                observables:   ObserverVisitor.observe(expression),
                path:          this.getPath(),
                rawExpression: directive.raw,
                stackTrace,
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

            let nodeIndex    = 0;
            let elementIndex = lastIndex - nonElementsCount;

            while (nextElementSibling && contains(nextElementSibling.getAttributeNames(), [DirectiveType.ElseIf, DirectiveType.Else]))
            {
                const simblingTemplate = this.decomposeDirectives(nextElementSibling);

                const simblingDirective = simblingTemplate[DIRECTIVE]!;

                const value = simblingDirective.type == DirectiveType.Else ? "true" : simblingDirective.value;

                nodeIndex = parentChildNodes.indexOf(nextElementSibling);

                this.indexStack.push(nodeIndex + lastIndex);

                if (!this.hasDecomposed(nextElementSibling))
                {
                    this.pushToStack(nextElementSibling, ++elementIndex);
                }

                const expression = this.tryParseExpression(parseExpression, value, simblingDirective.raw);
                const descriptor = TemplateParser.internalParse(this.name, simblingTemplate, this.stackTrace);

                const conditionalBranchDescriptor: IChoiceBranchDirective =
                {
                    descriptor,
                    expression,
                    observables:   ObserverVisitor.observe(expression),
                    path:          this.getPath(),
                    rawExpression: simblingDirective.raw,
                    stackTrace:    [...this.stackTrace],
                };

                branches.push(conditionalBranchDescriptor);

                nextElementSibling = simblingTemplate.nextElementSibling;

                this.saveLookup();

                this.indexStack.pop();
                this.stackTrace.pop();
            }

            this.offsetIndex = nodeIndex;

            this.indexStack.push(lastIndex);
            this.stackTrace.push(lastStack);

            this.templateDescriptor.directives.logicals.push({ branches });
        }
        else if (directive.type == DirectiveType.For)
        {
            const value = directive.value;

            const { left, right, operator } = this.tryParseExpression(parseForLoopStatement, value, directive.raw);

            const descriptor  = TemplateParser.internalParse(this.name, template, this.stackTrace);
            const observables = ObserverVisitor.observe(right);

            const loopDescriptor: ILoopDirective =
            {
                descriptor,
                left,
                observables,
                operator,
                path:          this.getPath(),
                rawExpression: directive.raw,
                right,
                stackTrace,
            };

            this.templateDescriptor.directives.loops.push(loopDescriptor);

            this.saveLookup();
        }
        else if (directive.type == DirectiveType.Placeholder)
        {
            const { key, raw, rawKey, value } = directive;

            const keyExpression  = this.tryParseExpression(parseExpression, key, rawKey);
            const expression     = this.tryParseExpression(parseExpression, `${value || "undefined"}`, raw);
            const keyObservables = ObserverVisitor.observe(keyExpression);
            const observables    = ObserverVisitor.observe(expression);
            const descriptor     = TemplateParser.internalParse(this.name, template, this.stackTrace);

            const placeholderDirective: IPlaceholderDirective =
            {
                descriptor,
                expression,
                keyExpression,
                keyObservables,
                observables,
                path:             this.getPath(),
                rawExpression:    raw,
                rawKeyExpression: rawKey,
                stackTrace,
            };

            this.templateDescriptor.directives.placeholders.push(placeholderDirective);

            this.saveLookup();
        }
        else if (directive.type == DirectiveType.Inject)
        {
            const { key, raw, rawKey, value } = directive;

            const destructured = /^\s*\{/.test(value);

            const keyExpression  = this.tryParseExpression(parseExpression, key, rawKey);
            const pattern        = this.tryParseExpression(destructured ? parseDestructuredPattern : parseExpression, `${value || "__scope__"}`, raw) as IPattern | IIdentifier;
            const keyObservables = ObserverVisitor.observe(keyExpression);
            const observables    = ObserverVisitor.observe(pattern);

            const descriptor = TemplateParser.internalParse(this.name, template, this.stackTrace);

            const injectionDescriptor: IInjectDirective =
            {
                descriptor,
                keyExpression,
                keyObservables,
                observables,
                path:             this.getPath(),
                pattern,
                rawExpression:    raw,
                rawKeyExpression: rawKey,
                stackTrace,
            };

            this.templateDescriptor.directives.injections.push(injectionDescriptor);

            this.saveLookup();
        }

        // istanbul ignore if
        if (!TemplateParser.testEnviroment)
        {
            template.removeAttribute(directive.name);
            template.removeAttribute(`${directive.name}-key`);
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

            const textNodeDescriptor: ITextNodeDescriptor =
            {
                expression,
                observables,
                path,
                rawExpression,
                stackTrace: [...this.stackTrace],
            };

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

                this.templateDescriptor.elements.push
                ({
                    attributes: [],
                    directives: [],
                    events:     [],
                    path:       parentPath,
                    textNodes:  [textNodeDescriptor],
                });
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
        const stackEntry: string[] = [];

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
        let nonElementsCount = 0;

        for (let index = 0; index < node.childNodes.length; index++)
        {
            const childNode = node.childNodes[index];

            if ((childNode.nodeType == Node.ELEMENT_NODE || childNode.nodeType == Node.TEXT_NODE) && childNode.nodeName != "SCRIPT" && childNode.nodeName != "STYLE")
            {
                this.indexStack.push(index);

                if (!this.hasDecomposed(childNode))
                {
                    this.pushToStack(childNode, index - nonElementsCount);
                }

                if (typeGuard<Element>(childNode, childNode.nodeType == Node.ELEMENT_NODE))
                {
                    if (childNode.hasAttribute(DirectiveType.ElseIf))
                    {
                        const message = `Unexpected ${DirectiveType.ElseIf} directive. ${DirectiveType.ElseIf} must be used in an element next to an element that uses the ${DirectiveType.ElseIf} directive.`;

                        throwTemplateParseError(message, this.stackTrace);
                    }

                    if (childNode.hasAttribute(DirectiveType.Else))
                    {
                        const message = `Unexpected ${DirectiveType.Else} directive. ${DirectiveType.Else} must be used in an element next to an element that uses the ${DirectiveType.If} or ${DirectiveType.ElseIf} directive.`;

                        throwTemplateParseError(message, this.stackTrace);
                    }

                    if (this.hasTemplateDirectives(childNode))
                    {
                        this.offsetIndex = 0;

                        this.parseTemplateDirectives(childNode, nonElementsCount);

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

                    nonElementsCount++;
                }

                this.traverseNode(childNode);

                this.indexStack.pop();
                this.stackTrace.pop();
            }
            else
            {
                nonElementsCount++;
            }
        }
    }

    private trimContent(content: DocumentFragment): void
    {
        if (content.firstChild != content.firstElementChild)
        {
            while (content.firstChild?.nodeType == Node.TEXT_NODE && content.firstChild.textContent?.trim() == "")
            {
                content.firstChild.remove();
            }
        }

        if (content.lastChild != content.lastElementChild)
        {
            while (content.lastChild?.nodeType == Node.TEXT_NODE && content.lastChild.textContent?.trim() == "")
            {
                content.lastChild.remove();
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private tryParseExpression<TParser extends (expression: string) => any>(parser: TParser, expression: string, rawExpression: string): ReturnType<TParser>
    {
        try
        {
            return parser(expression);
        }
        catch (error)
        {
            assert(error instanceof Error);

            const message = `Parsing error in ${rawExpression}: ${error.message}${error instanceof SyntaxError ? ` at position ${error.index}` : ""}`;

            throwTemplateParseError(message, this.stackTrace);
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
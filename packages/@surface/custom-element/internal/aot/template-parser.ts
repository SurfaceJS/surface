/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-statements */
/* eslint-disable @typescript-eslint/indent */

import type { Indexer }                                                                                           from "@surface/core";
import { assert, contains, dashedToCamel, typeGuard }                                                             from "@surface/core";
import type { IExpression, IIdentifier, IPattern }                                                                from "@surface/expression";
import Expression, { SyntaxError, TypeGuard }                                                                     from "@surface/expression";
import { buildStackTrace, scapeBrackets, throwTemplateParseError }                                                from "../common.js";
import { parseDestructuredPattern, parseExpression, parseForLoopStatement, parseInterpolation }                   from "../parsers/expression-parsers.js";
import nativeEvents                                                                                               from "../parsers/native-events.js";
import { interpolation }                                                                                          from "../parsers/patterns.js";
import ObserverVisitor                                                                                            from "../reactivity/observer-visitor.js";
import type { StackTrace }                                                                                        from "../types";
import type Descriptor                                                                                            from "./types/descriptor.js";
import type
{
    AttributeDescritor,
    BranchDescriptor,
    ElementDescriptor,
    FragmentDescriptor,
    InjectionStatementDescriptor,
    PlaceholderStatementDescriptor,
} from "./types/descriptor.js";

const DECOMPOSED = Symbol("custom-element:decomposed");

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
    private readonly name:       string;
    private readonly stackTrace: StackTrace;

    private index: number = 0;

    public constructor(name: string, stackTrace?: StackTrace)
    {
        this.name = name;

        this.stackTrace = stackTrace ? [...stackTrace] : [[`<${name}>`], ["#shadow-root"]];
    }

    private static internalParse(name: string, template: HTMLTemplateElement, stackTrace: StackTrace): FragmentDescriptor
    {
        return new TemplateParser(name, stackTrace).parse(template);
    }

    public static parse(name: string, template: string): Descriptor
    {
        const templateElement = document.createElement("template");
        templateElement.innerHTML = template;

        return new TemplateParser(name).parse(templateElement);
    }

    private attributeToString(attribute: Attr): string
    {
        return !attribute.value ? attribute.name : `${attribute.name}="${attribute.value}"`;
    }

    private decomposeDirectives(element: Element): [HTMLTemplateElement, Directive]
    {
        const template = this.elementToTemplate(element);

        const [directive, ...directives] = this.enumerateDirectives(template.attributes);

        if (directives.length > 0)
        {
            const innerTemplate = template.cloneNode(false) as HTMLTemplateElement;

            directives.forEach(x => template.removeAttribute(x.name));

            innerTemplate.removeAttribute(directive.name);
            innerTemplate.removeAttribute(`${directive.name}-key`);

            this.markAsDecomposed(innerTemplate);

            innerTemplate.content.appendChild(template.content);

            template.content.appendChild(innerTemplate);
        }

        return [template, directive];
    }

    private elementToTemplate(element: Element): HTMLTemplateElement
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

            this.markAsDecomposed(clone);
            this.markAsDecomposed(template);

            return template;
        }

        return element as HTMLTemplateElement;
    }

    private enumerateDirectives(namedNodeMap: NamedNodeMap): Iterable<Directive>;
    private *enumerateDirectives(namedNodeMap: NamedNodeMap & Indexer<Attr>): Iterable<Directive>
    {
        const KEYED_DIRECTIVES = [DirectiveType.Inject, DirectiveType.Placeholder];

        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < namedNodeMap.length; i++)
        {
            const attribute = namedNodeMap[i];

            if (!attribute.name.endsWith("-key"))
            {
                const raw = this.attributeToString(attribute);

                let isKeyed = false;

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

                        yield {
                            key,
                            name:  attribute.name,
                            raw,
                            rawKey,
                            type,
                            value: attribute.value,
                        };

                        isKeyed = true;

                        break;
                    }
                }

                if (!isKeyed)
                {
                    yield {
                        key:    "",
                        name:   attribute.name,
                        raw,
                        rawKey: "",
                        type:   attribute.name as DirectiveType,
                        value:  attribute.value,
                    };
                }
            }
        }
    }

    private *enumerateParsedNodes(node: Node): Iterable<Descriptor>
    {
        let nonElementsCount = 0;

        for (let index = 0; index < node.childNodes.length; index++)
        {
            const childNode = node.childNodes[index];

            if (childNode.nodeType == Node.ELEMENT_NODE || childNode.nodeType == Node.TEXT_NODE)
            {
                if (!this.isDecomposed(childNode))
                {
                    this.pushToStack(childNode, index - nonElementsCount);
                }

                const stackTrace = [...this.stackTrace];

                if (typeGuard<Element>(childNode, childNode.nodeType == Node.ELEMENT_NODE))
                {
                    if (childNode.hasAttribute(DirectiveType.ElseIf))
                    {
                        const message = `Unexpected ${DirectiveType.ElseIf} directive. ${DirectiveType.ElseIf} must be used in an element next to an element that uses the ${DirectiveType.ElseIf} directive.`;

                        throwTemplateParseError(message, stackTrace);
                    }

                    if (childNode.hasAttribute(DirectiveType.Else))
                    {
                        const message = `Unexpected ${DirectiveType.Else} directive. ${DirectiveType.Else} must be used in an element next to an element that uses the ${DirectiveType.If} or ${DirectiveType.ElseIf} directive.`;

                        throwTemplateParseError(message, stackTrace);
                    }

                    if (this.hasTemplateDirectives(childNode))
                    {
                        this.index = index;

                        yield this.parseDirectives(childNode, stackTrace, nonElementsCount);

                        index = this.index;

                        this.stackTrace.pop();

                        continue;
                    }
                    else
                    {
                        yield this.parseElement(childNode, stackTrace);
                    }
                }
                else
                {
                    yield this.parseTextNode(childNode as Text, stackTrace);

                    nonElementsCount++;
                }

                this.stackTrace.pop();
            }
            else
            {
                if (childNode.nodeType == Node.COMMENT_NODE)
                {
                    yield { type: "comment", value: childNode.textContent ?? "" };
                }

                nonElementsCount++;
            }
        }
    }

    private isDecomposed(element: Node & { [DECOMPOSED]?: boolean }): boolean
    {
        return !!element[DECOMPOSED];
    }

    private hasTemplateDirectives(element: Element): boolean
    {
        return element.getAttributeNames().some(attribute => directiveTypes.some(directive => attribute.startsWith(directive)));
    }

    private markAsDecomposed(element: Element & { [DECOMPOSED]?: boolean }): void
    {
        element[DECOMPOSED] = true;
    }

    private nodeToString(node: Node): string;
    private nodeToString(node: (Element | Text)): string
    {
        if (typeGuard<Text>(node, node.nodeType == Node.TEXT_NODE))
        {
            return node.nodeValue!;
        }

        const attributes = Array.from(node.attributes)
            .map(this.attributeToString)
            .join(" ");

        return `<${node.nodeName.toLowerCase()}${node.attributes.length == 0 ? "" : " "}${attributes}>`;
    }

    private parse(template: HTMLTemplateElement): FragmentDescriptor
    {
        this.trimContent(template.content);

        return { childs: this.enumerateParsedNodes(template.content), type: "fragment" };
    }

    private *parseAttributes(element: Element, stackTrace: StackTrace): Iterable<AttributeDescritor>
    {
        for (let i = 0; i < element.attributes.length; i++)
        {
            const attribute = element.attributes[i];

            const raw = this.attributeToString(attribute);

            if (attribute.name.startsWith("@"))
            {
                const name              = attribute.name.replace(/^@/, "");
                const unknownExpression = this.tryParseExpression(parseExpression, attribute.value, raw);

                const expression = TypeGuard.isMemberExpression(unknownExpression) || TypeGuard.isArrowFunctionExpression(unknownExpression)
                    ? unknownExpression
                    : Expression.arrowFunction([], unknownExpression);

                yield { key: name, source: raw, stackTrace, type: "event", value: expression };
            }
            else if (attribute.name.startsWith("#"))
            {
                const name        = attribute.name.replace(/^#/, "");
                const expression  = this.tryParseExpression(parseExpression, attribute.value || "undefined", raw);
                const observables = ObserverVisitor.observe(expression);

                yield { key: name, observables, source: raw, stackTrace, type: "directive", value: expression };
            }
            else if (attribute.name.startsWith(":") || interpolation.test(attribute.value) && !(/^on\w/.test(attribute.name) && nativeEvents.has(attribute.name)))
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

                const expression = this.tryParseExpression(isInterpolation ? parseInterpolation : parseExpression, attribute.value, raw);

                if (isTwoWay && !this.validateMemberExpression(expression, true))
                {
                    throwTemplateParseError(`Two way data bind cannot be applied to dynamic properties: "${attribute.value}"`, this.stackTrace);
                }

                const observables = ObserverVisitor.observe(expression);

                if (type == "interpolation")
                {
                    yield { key: attribute.name, type: "raw", value: "" };
                    yield { key: attribute.name, observables, source: raw, stackTrace, type, value: expression };
                }
                else if (type == "twoway")
                {
                    yield { left: key, right: observables[0], source: raw, stackTrace, type };
                }
                else
                {
                    yield { key, observables, source: raw, stackTrace, type, value: expression };
                }
            }
            else
            {
                yield { key: attribute.name, type: "raw", value: attribute.value };
            }
        }
    }

    private parseDirectives(element: Element, stackTrace: StackTrace, nonElementsCount: number): Descriptor
    {
        const [template, directive] = this.decomposeDirectives(element);

        if (directive.type == DirectiveType.If)
        {
            const branches: BranchDescriptor[] = [];

            const expression = this.tryParseExpression(parseExpression, directive.value, directive.raw);
            const fragment = TemplateParser.internalParse(this.name, template, this.stackTrace);

            const branchDescriptor: BranchDescriptor =
            {
                expression,
                fragment,
                observables: ObserverVisitor.observe(expression),
                source:      directive.raw,
                stackTrace,
            };

            branches.push(branchDescriptor);

            let node = template as Node & Partial<Pick<NonDocumentTypeChildNode, "nextElementSibling">>;

            const lastStack = this.stackTrace.pop()!;

            let elementIndex = this.index - nonElementsCount;

            while (node.nextElementSibling && contains(node.nextElementSibling.getAttributeNames(), [DirectiveType.ElseIf, DirectiveType.Else]))
            {
                while (node.nextSibling && node.nextSibling != node.nextElementSibling)
                {
                    this.index++;

                    if (node.nextSibling.nodeType == Node.TEXT_NODE && node.nextSibling.textContent?.trim() != "")
                    {
                        this.pushToStack(node.nextSibling, this.index - nonElementsCount);

                        const message = `${"Any content between conditional statement branches will be ignored.\n"}${buildStackTrace(this.stackTrace)}`;

                        console.warn(message);

                        this.stackTrace.pop();
                    }

                    node = node.nextSibling;
                }

                const nextElementSibling = node.nextElementSibling!;

                const [simblingTemplate, simblingDirective] = this.decomposeDirectives(node.nextElementSibling!);

                if (!this.isDecomposed(nextElementSibling))
                {
                    this.pushToStack(nextElementSibling, ++elementIndex);
                }

                const value = simblingDirective.type == DirectiveType.Else ? "true" : simblingDirective.value;

                this.index++;

                const expression = this.tryParseExpression(parseExpression, value, simblingDirective.raw);
                const fragment = TemplateParser.internalParse(this.name, simblingTemplate, this.stackTrace);

                const conditionalBranchDescriptor: BranchDescriptor =
                {
                    expression,
                    fragment,
                    observables: ObserverVisitor.observe(expression),
                    source:      simblingDirective.raw,
                    stackTrace:  [...this.stackTrace],
                };

                branches.push(conditionalBranchDescriptor);

                node = simblingTemplate;

                this.stackTrace.pop();
            }

            this.stackTrace.push(lastStack);

            return { branches, type: "choice-statement" };
        }
        else if (directive.type == DirectiveType.For)
        {
            const value = directive.value;

            const { left, right, operator } = this.tryParseExpression(parseForLoopStatement, value, directive.raw);

            const fragment    = TemplateParser.internalParse(this.name, template, this.stackTrace);
            const observables = ObserverVisitor.observe(right);

            const loopDescriptor: Descriptor =
            {
                fragment,
                left,
                observables,
                operator,
                right,
                source:  directive.raw,
                stackTrace,
                type:   "loop-statement",
            };

            return loopDescriptor;
        }
        else if (directive.type == DirectiveType.Placeholder)
        {
            const { key, raw, rawKey, value } = directive;

            const keyExpression  = this.tryParseExpression(parseExpression, key, rawKey);
            const expression     = this.tryParseExpression(parseExpression, `${value || "undefined"}`, raw);
            const keyObservables = ObserverVisitor.observe(keyExpression);
            const observables    = ObserverVisitor.observe(expression);
            const fragment       = TemplateParser.internalParse(this.name, template, this.stackTrace);

            const placeholderDirective: PlaceholderStatementDescriptor =
            {
                fragment,
                key:         keyExpression,
                observables: { key: keyObservables, value: observables },
                source:         { key: rawKey, value: raw },
                stackTrace,
                type:        "placeholder-statement",
                value:       expression,
            };

            return placeholderDirective;
        }

        const { key, raw, rawKey, value } = directive;

        const destructured = /^\s*\{/.test(value);

        const keyExpression  = this.tryParseExpression(parseExpression, key, rawKey);
        const pattern        = this.tryParseExpression(destructured ? parseDestructuredPattern : parseExpression, `${value || "{ }"}`, raw) as IPattern | IIdentifier;
        const keyObservables = ObserverVisitor.observe(keyExpression);
        const observables    = ObserverVisitor.observe(pattern);

        const fragment = TemplateParser.internalParse(this.name, template, this.stackTrace);

        const injectionDescriptor: InjectionStatementDescriptor =
        {
            fragment,
            key:         keyExpression,
            observables: { key: keyObservables, value: observables },
            source:      { key: rawKey, value: raw },
            stackTrace,
            type:        "injection-statement",
            value:       pattern,
        };

        return injectionDescriptor;
    }

    private parseElement(element: Element, stackTrace: StackTrace): ElementDescriptor
    {
        const descriptor: ElementDescriptor =
        {
            attributes: this.parseAttributes(element, stackTrace),
            childs:     element.nodeName == "SCRIPT" || element.nodeName == "STYLE" ? [{ type: "text", value: Expression.literal(element.textContent) }] : this.enumerateParsedNodes(element),
            tag:        element.nodeName,
            type:       "element",
        };

        return descriptor;
    }

    private parseTextNode(node: Text, stackTrace: StackTrace): Descriptor
    {
        assert(node.nodeValue);

        if (interpolation.test(node.nodeValue))
        {
            const expression  = this.tryParseExpression(parseInterpolation, node.nodeValue, node.nodeValue);
            const observables = ObserverVisitor.observe(expression);

            const descriptor: Descriptor =
            {
                observables,
                source: node.nodeValue,
                stackTrace,
                type:   "text",
                value:  expression,
            };

            return descriptor;
        }

        const descriptor: Descriptor =
        {
            type:  "text",
            value: Expression.literal(scapeBrackets(node.nodeValue!)),
        };

        return descriptor;
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

    private trimContent(content: DocumentFragment): void
    {
        if (content.firstChild && content.firstChild != content.firstElementChild)
        {
            while (content.firstChild.nodeType == Node.TEXT_NODE && content.firstChild.textContent!.trim() == "")
            {
                content.firstChild.remove();
            }
        }

        if (content.lastChild && content.lastChild != content.lastElementChild)
        {
            while (content.lastChild.nodeType == Node.TEXT_NODE && content.lastChild.textContent!.trim() == "")
            {
                content.lastChild.remove();
            }
        }
    }

    private tryParseExpression<TParser extends (expression: string) => unknown>(parser: TParser, expression: string, rawExpression: string): ReturnType<TParser>
    {
        try
        {
            return parser(expression) as ReturnType<TParser>;
        }
        catch (error)
        {
            assert(error instanceof SyntaxError);

            const message = `Parsing error in '${rawExpression}': ${error.message} at position ${error.index}`;

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
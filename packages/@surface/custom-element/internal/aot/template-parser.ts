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
import type { BranchDescriptor, ElementDescriptor, InjectionStatementDescriptor, PlaceholderStatementDescriptor } from "./types/descriptor.js";

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

    private static internalParse(name: string, template: HTMLTemplateElement, stackTrace: StackTrace): Descriptor
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

            return template;
        }

        return element as HTMLTemplateElement;
    }

    private nodeToString(node: Node): string;
    private nodeToString(node: (Element | Text)): string
    {
        if (typeGuard<Text>(node, node.nodeType == Node.TEXT_NODE))
        {
            return node.nodeValue!;
        }

        if (typeGuard<Comment>(node, node.nodeType == Node.COMMENT_NODE))
        {
            return `<!--${node.nodeValue!}-->`;
        }

        const attributes = Array.from(node.attributes)
            .map(this.attributeToString)
            .join(" ");

        return `<${node.nodeName.toLowerCase()}${node.attributes.length == 0 ? "" : " "}${attributes}>`;
    }

    private hasTemplateDirectives(element: Element): boolean
    {
        return element.getAttributeNames().some(attribute => directiveTypes.some(directive => attribute.startsWith(directive)));
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

    private parse(template: HTMLTemplateElement): Descriptor
    {
        return { childs: this.traverseNodes(template.content), type: "fragment" };
    }

    private parseElement(element: Element): ElementDescriptor
    {
        const attributes: ElementDescriptor["attributes"]  = [];
        const binds:      ElementDescriptor["binds"]       = [];
        const directives: ElementDescriptor["directives"]  = [];
        const events:     ElementDescriptor["events"]      = [];

        // const stackTrace = element.attributes.length > 0 ? [...this.stackTrace] : [];

        for (const attribute of Array.from(element.attributes))
        {
            if (attribute.name.startsWith("@"))
            {
                const name              = attribute.name.replace("@", "");
                const rawExpression     = `${attribute.name}=\"${attribute.value}\"`;
                const unknownExpression = this.tryParseExpression(parseExpression, attribute.value, rawExpression);

                const expression = TypeGuard.isMemberExpression(unknownExpression) || TypeGuard.isArrowFunctionExpression(unknownExpression)
                    ? unknownExpression
                    : Expression.arrowFunction([], unknownExpression);

                events.push({ key: name, value: expression });
            }
            else if (attribute.name.startsWith("#"))
            {
                if (!attribute.name.endsWith("-key"))
                {
                    const DEFAULT_KEY       = "'default'";
                    const [rawName, rawKey] = attribute.name.split(":");
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

                    directives.push([keyExpression, expression, [keyObservables, observables]]);

                    element.removeAttributeNode(attribute);
                }
            }
            else if (attribute.name.startsWith(":") || interpolation.test(attribute.value) && !(/^on\w/.test(attribute.name) && nativeEvents.has(attribute.name)))
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

                binds.push({ key, observables, type, value: expression });
            }
            else
            {
                attributes.push({ key: attribute.name, value: attribute.value });
            }
        }

        const descriptor: ElementDescriptor =
        {
            attributes,
            binds,
            childs: element.nodeName == "SCRIPT" || element.nodeName == "STYLE"
                ? [{ observables: [], type: "text", value: Expression.literal(element.textContent) }]
                : this.traverseNodes(element),
            directives,
            events,
            tag:    element.nodeName,
            type:   "element",
        };

        return descriptor;
    }

    private parseDirectives(element: Element, nonElementsCount: number): Descriptor
    {
        const [template, directive] = this.decomposeDirectives(element);

        // const stackTrace = [...this.stackTrace];

        if (directive.type == DirectiveType.If)
        {
            const branches: BranchDescriptor[] = [];

            const expression = this.tryParseExpression(parseExpression, directive.value, directive.raw);
            const descriptor = TemplateParser.internalParse(this.name, template, this.stackTrace);

            const branchDescriptor: BranchDescriptor =
            {
                descriptor,
                expression,
                observables: ObserverVisitor.observe(expression),
            };

            branches.push(branchDescriptor);

            let node = template as Node & Partial<Pick<NonDocumentTypeChildNode, "nextElementSibling">>;

            const lastStack = this.stackTrace.pop()!;

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

                const [simblingTemplate, simblingDirective] = this.decomposeDirectives(node.nextElementSibling!);

                const value = simblingDirective.type == DirectiveType.Else ? "true" : simblingDirective.value;

                this.pushToStack(node.nextElementSibling!, this.index - nonElementsCount);

                this.index++;

                const expression = this.tryParseExpression(parseExpression, value, simblingDirective.raw);
                const descriptor = TemplateParser.internalParse(this.name, simblingTemplate, this.stackTrace);

                const conditionalBranchDescriptor: BranchDescriptor =
                {
                    descriptor,
                    expression,
                    observables: ObserverVisitor.observe(expression),
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

            const descriptor  = TemplateParser.internalParse(this.name, template, this.stackTrace);
            const observables = ObserverVisitor.observe(right);

            const loopDescriptor: Descriptor =
            {
                descriptor,
                left,
                observables,
                operator,
                right,
                type:        "loop-statement",
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
            const descriptor     = TemplateParser.internalParse(this.name, template, this.stackTrace);

            const placeholderDirective: PlaceholderStatementDescriptor =
            {
                descriptor,
                key:         keyExpression,
                observables: { key: keyObservables, value: observables },
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

        const descriptor = TemplateParser.internalParse(this.name, template, this.stackTrace);

        const injectionDescriptor: InjectionStatementDescriptor =
        {
            descriptor,
            key:         keyExpression,
            observables: { key: keyObservables, value: observables },
            type:        "injection-statement",
            value:       pattern,
        };

        return injectionDescriptor;
    }

    private parseTextNode(node: Text): Descriptor
    {
        assert(node.nodeValue);

        if (interpolation.test(node.nodeValue))
        {
            const rawExpression = node.nodeValue;

            const expression  = this.tryParseExpression(parseInterpolation, rawExpression, `"${rawExpression}"`);
            const observables = ObserverVisitor.observe(expression);

            const descriptor: Descriptor =
            {
                observables,
                type:       "text",
                value: expression,
            };

            return descriptor;
        }

        const descriptor: Descriptor =
        {
            observables: [],
            type:        "text",
            value:       Expression.literal(scapeBrackets(node.nodeValue!)),
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

    private traverseNodes(node: Node): Descriptor[]
    {
        let nonElementsCount = 0;

        const nodes: Descriptor[] = [];

        for (let index = 0; index < node.childNodes.length; index++)
        {
            const childNode = node.childNodes[index];

            if (childNode.nodeType == Node.ELEMENT_NODE || childNode.nodeType == Node.TEXT_NODE)
            {
                this.pushToStack(childNode, index - nonElementsCount);

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
                        this.index = index;

                        nodes.push(this.parseDirectives(childNode, nonElementsCount));

                        index = this.index;

                        this.stackTrace.pop();

                        continue;
                    }
                    else
                    {
                        nodes.push(this.parseElement(childNode));
                    }
                }
                else
                {
                    nodes.push(this.parseTextNode(childNode as Text));

                    nonElementsCount++;
                }

                this.stackTrace.pop();
            }
            else
            {
                if (childNode.nodeType == Node.COMMENT_NODE)
                {
                    nodes.push({ type: "comment", value: childNode.textContent ?? "" });
                }
                nonElementsCount++;
            }
        }

        return nodes;
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

            const message = `Parsing error in ${rawExpression}: ${error.message} at position ${error.index}`;

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
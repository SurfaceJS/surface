/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-statements */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/indent */
import type { Indexer }                                                                         from "@surface/core";
import { assert, contains, dashedToCamel, typeGuard }                                           from "@surface/core";
import type { IExpression, IPattern, Identifier }                                               from "@surface/expression";
import { ArrowFunctionExpression, Literal, SyntaxError, TypeGuard }                             from "@surface/expression";
import { buildStackTrace, scapeBrackets, throwTemplateParseError }                              from "./common.js";
import DescriptorType                                                                           from "./descriptor-type.js";
import { parseDestructuredPattern, parseExpression, parseForLoopStatement, parseInterpolation } from "./expression-parsers.js";
import nativeEvents                                                                             from "./native-events.js";
import ObserverVisitor                                                                          from "./observer-visitor.js";
import { interpolation }                                                                        from "./patterns.js";
import type Descriptor                                                                          from "./types/descriptor.js";
import type
{
    AttributeBindDescritor,
    BranchDescriptor,
    ElementDescriptor,
    FragmentDescriptor,
    InjectionStatementDescriptor,
    PlaceholderStatementDescriptor,
} from "./types/descriptor.js";
import type StackTrace from "./types/stack-trace";

const DECOMPOSED = Symbol("htmlx-parser:decomposed");

enum NodeType
{
    Element = 1,
    Text    = 3,
    Comment = 8,
}

enum DirectiveType
{
    Else              = "#else",
    ElseIf            = "#else-if",
    Extends           = "#extends",
    ExtendsAttributes = "#extends.attributes",
    ExtendsBinds      = "#extends.binds",
    ExtendsInjections = "#extends.injections",
    ExtendsListeners  = "#extends.listeners",
    For               = "#for",
    If                = "#if",
    Inject            = "#inject",
    InjectKey         = "#inject.key",
    InjectScope       = "#inject.scope",
    Placeholder       = "#placeholder",
    PlaceholderKey    = "#placeholder.key",
    PlaceholderScope  = "#placeholder.scope",
}

const directiveTypes    = Object.values(DirectiveType);
const directiveTypesSet = new Set(directiveTypes);

type DirectiveValue =
{
    expression: string,
    source:     string,
};

type KeyedDirective  =
{
    name:  string,
    key:   DirectiveValue,
    scope: DirectiveValue,
    type:  DirectiveType.Inject | DirectiveType.Placeholder,
};

type StatementDirective  =
{
    name:       string,
    source:     string,
    type:       DirectiveType.If | DirectiveType.Else | DirectiveType.ElseIf | DirectiveType.For,
    expression: string,
};

type ExtendsDirective  =
{
    name:     string,
    metadata: DirectiveValue,
    type:     DirectiveType.Extends,
} |
{
    name:  string,
    attributes: DirectiveValue,
    binds:      DirectiveValue,
    injections: DirectiveValue,
    listeners:  DirectiveValue,
    type:       DirectiveType.Extends,
};

type Directive = ExtendsDirective | KeyedDirective | StatementDirective;

export default class Parser
{
    private readonly stackTrace: StackTrace;

    private index: number = 0;

    public constructor(private readonly document: Document, private readonly name: string, stackTrace?: StackTrace)
    {
        this.name = name;

        this.stackTrace = stackTrace ? [...stackTrace] : [[`<${name}>`], ["#shadow-root"]];
    }

    public static parse(document: Document, name: string, template: string): Descriptor
    {
        const templateElement = document.createElement("template");
        templateElement.innerHTML = template;

        return new Parser(document, name).parse(templateElement);
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

            directives.forEach(x => this.removeDirectives(template, x));

            this.removeDirectives(innerTemplate, directive);

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
            const template = this.document.createElement("template");
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
        const KEYED_DIRECTIVES = [DirectiveType.Inject, DirectiveType.Placeholder] as const;

        const duplications = new Set<string>();
        const resolved     = new Set<string>();

        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < namedNodeMap.length; i++)
        {
            const attribute = namedNodeMap[i];

            if (!resolved.has(attribute.name))
            {
                const source = this.attributeToString(attribute);

                let handled = false;

                for (const directive of KEYED_DIRECTIVES)
                {
                    if (attribute.name == directive || attribute.name == `${directive}.key` || attribute.name == `${directive}.scope` || attribute.name.startsWith(`${directive}:`))
                    {
                        if (attribute.name == directive && (namedNodeMap[`${directive}.key`] || namedNodeMap[`${directive}.scope`]) || duplications.has(directive))
                        {
                            const message = `Multiples ${directive} directives on same element is not supported.`;

                            throwTemplateParseError(message, this.stackTrace);
                        }

                        duplications.add(directive);

                        if (attribute.name == directive)
                        {
                            yield {
                                key:   { expression: "'default'", source: "" },
                                name:  directive,
                                scope: { expression: attribute.value, source },
                                type:  directive,
                            };
                        }
                        else if (attribute.name.includes(":"))
                        {
                            const [type, key] = attribute.name.split(":") as [DirectiveType.Inject, DirectiveType.Placeholder, string | undefined];

                            if (!key)
                            {
                                const message = `Directive ${directive} has no key.`;

                                throwTemplateParseError(message, this.stackTrace);
                            }

                            yield {
                                key:   { expression: `"${key}"`, source: "" },
                                name:  attribute.name,
                                scope: { expression: attribute.value, source },
                                type,
                            };
                        }
                        else
                        {
                            resolved.add(`${directive}.key`);
                            resolved.add(`${directive}.scope`);

                            const [key, scope] = attribute.name == `${directive}.key`
                                ? [attribute.value, namedNodeMap[`${directive}.scope`]?.value]
                                : [namedNodeMap[`${directive}.key`]?.value, attribute.value];

                            yield {
                                key:   { expression: key ?? "'default'", source: key ? `${directive}.key="${key}"` : "" },
                                name:  directive,
                                scope: { expression: scope ?? "", source: scope ? `${directive}.scope="${scope}"` : "" },
                                type:  directive,
                            };
                        }

                        handled = true;
                    }
                }

                if (!handled)
                {
                    if (attribute.name == DirectiveType.Extends || attribute.name.startsWith(DirectiveType.Extends))
                    {
                        resolved.add(DirectiveType.ExtendsAttributes);
                        resolved.add(DirectiveType.ExtendsBinds);
                        resolved.add(DirectiveType.ExtendsInjections);
                        resolved.add(DirectiveType.ExtendsListeners);

                        if (attribute.name == DirectiveType.Extends)
                        {

                            yield {
                                metadata: { expression: attribute.value, source },
                                name:       DirectiveType.Extends,
                                type:       DirectiveType.Extends,
                            };
                        }
                        else
                        {
                            const attributes = namedNodeMap[DirectiveType.ExtendsAttributes]?.value;
                            const binds      = namedNodeMap[DirectiveType.ExtendsBinds]?.value;
                            const injections = namedNodeMap[DirectiveType.ExtendsInjections]?.value;
                            const listeners  = namedNodeMap[DirectiveType.ExtendsListeners]?.value;

                            yield {
                                attributes:
                                {
                                    expression: attributes ?? "null",
                                    source:     attributes ? `${DirectiveType.ExtendsAttributes}="${attributes}"` : "",
                                },
                                binds:
                                {
                                    expression: binds ?? "null",
                                    source:     binds ? `${DirectiveType.ExtendsBinds}="${binds}"` : "",
                                },
                                injections:
                                {
                                    expression: injections ?? "null",
                                    source:     injections ? `${DirectiveType.ExtendsInjections}="${injections}"` : "",
                                },
                                listeners:
                                {
                                    expression: listeners ?? "null",
                                    source:     listeners ? `${DirectiveType.ExtendsListeners}="${listeners}"` : "",
                                },
                                name: DirectiveType.Extends,
                                type: DirectiveType.Extends,
                            };
                        }
                    }
                    else if (directiveTypesSet.has(attribute.name as DirectiveType))
                    {
                        yield {
                            expression: attribute.value,
                            name:       attribute.name,
                            source,
                            type:       attribute.name as DirectiveType.If | DirectiveType.Else | DirectiveType.ElseIf | DirectiveType.For,
                        };
                    }
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

            if (childNode.nodeType == NodeType.Element || childNode.nodeType == NodeType.Text)
            {
                if (!this.isDecomposed(childNode))
                {
                    this.pushToStack(childNode, index - nonElementsCount);
                }

                const stackTrace = [...this.stackTrace];

                if (typeGuard<Element>(childNode, childNode.nodeType == NodeType.Element))
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
                else if (!!childNode.nodeValue?.trim())
                {
                    yield this.parseTextNode(childNode as Text, stackTrace);

                    nonElementsCount++;
                }

                this.stackTrace.pop();
            }
            else
            {
                if (childNode.nodeType == NodeType.Comment)
                {
                    yield { type: DescriptorType.Comment, value: childNode.textContent ?? "" };
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
        return element.getAttributeNames()
            .some(attribute => directiveTypes.some(directive => attribute == directive || attribute.startsWith(`${DirectiveType.Inject}:`) || attribute.startsWith(`${DirectiveType.Placeholder}:`)));
    }

    private markAsDecomposed(element: Element & { [DECOMPOSED]?: boolean }): void
    {
        element[DECOMPOSED] = true;
    }

    private nodeToString(node: Node): string;
    private nodeToString(node: (Element | Text)): string
    {
        if (typeGuard<Text>(node, node.nodeType == NodeType.Text))
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

        return { childs: this.enumerateParsedNodes(template.content), type: DescriptorType.Fragment };
    }

    private *parseAttributes(element: Element, stackTrace: StackTrace): Iterable<AttributeBindDescritor>
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
                    : new ArrowFunctionExpression([], unknownExpression);

                const context = TypeGuard.isMemberExpression(expression) ? expression.object : new Literal(null);

                yield { context, key: name, source: raw, stackTrace, type: DescriptorType.Event, value: expression };
            }
            else if (attribute.name.startsWith("#"))
            {
                const name        = attribute.name.replace(/^#/, "");
                const expression  = this.tryParseExpression(parseExpression, attribute.value || "undefined", raw);
                const observables = ObserverVisitor.observe(expression);

                yield { key: name, observables, source: raw, stackTrace, type: DescriptorType.Directive, value: expression };
            }
            else if (attribute.name.startsWith(":") || interpolation.test(attribute.value) && !(/^on\w/.test(attribute.name) && nativeEvents.has(attribute.name)))
            {
                const name            = attribute.name.replace(/^::?/, "");
                const key             = dashedToCamel(name);
                const isTwoWay        = attribute.name.startsWith("::");
                const isOneWay        = !isTwoWay && attribute.name.startsWith(":");
                const isInterpolation = !isOneWay && !isTwoWay;

                const type = isOneWay
                    ? DescriptorType.Oneway
                    : isTwoWay
                        ? DescriptorType.Twoway
                        : DescriptorType.Interpolation;

                const expression = this.tryParseExpression(isInterpolation ? parseInterpolation : parseExpression, attribute.value, raw);

                if (isTwoWay && !this.validateMemberExpression(expression, true))
                {
                    throwTemplateParseError(`Two way data bind cannot be applied to dynamic properties: "${attribute.value}"`, this.stackTrace);
                }

                const observables = ObserverVisitor.observe(expression);

                if (type == DescriptorType.Interpolation)
                {
                    yield { key: attribute.name, type: DescriptorType.Attribute, value: "" };
                    yield { key: attribute.name, observables, source: raw, stackTrace, type, value: expression };
                }
                else if (type == DescriptorType.Twoway)
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
                yield { key: attribute.name, type: DescriptorType.Attribute, value: attribute.value };
            }
        }
    }

    private parseDirectives(element: Element, stackTrace: StackTrace, nonElementsCount: number): Descriptor
    {
        const [template, directive] = this.decomposeDirectives(element);

        if (directive.type == DirectiveType.If)
        {
            const branches: BranchDescriptor[] = [];

            const expression = this.tryParseExpression(parseExpression, directive.expression, directive.source);
            const fragment   = this.parseTemplate(template);

            const branchDescriptor: BranchDescriptor =
            {
                expression,
                fragment,
                observables: ObserverVisitor.observe(expression),
                source:      directive.source,
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

                    if (node.nextSibling.nodeType == NodeType.Text && node.nextSibling.textContent?.trim() != "")
                    {
                        this.pushToStack(node.nextSibling, this.index - nonElementsCount);

                        const message = `${"Any content between conditional statement branches will be ignored.\n"}${buildStackTrace(this.stackTrace)}`;

                        console.warn(message);

                        this.stackTrace.pop();
                    }

                    node = node.nextSibling;
                }

                const nextElementSibling = node.nextElementSibling!;

                const [simblingTemplate, simblingDirective] = this.decomposeDirectives(node.nextElementSibling!) as [HTMLTemplateElement, StatementDirective];

                if (!this.isDecomposed(nextElementSibling))
                {
                    this.pushToStack(nextElementSibling, ++elementIndex);
                }

                const value = simblingDirective.type == DirectiveType.Else ? "true" : simblingDirective.expression;

                this.index++;

                const expression = this.tryParseExpression(parseExpression, value, simblingDirective.source);
                const fragment = this.parseTemplate(simblingTemplate);

                const conditionalBranchDescriptor: BranchDescriptor =
                {
                    expression,
                    fragment,
                    observables: ObserverVisitor.observe(expression),
                    source:      simblingDirective.source,
                    stackTrace:  [...this.stackTrace],
                };

                branches.push(conditionalBranchDescriptor);

                node = simblingTemplate;

                this.stackTrace.pop();
            }

            this.stackTrace.push(lastStack);

            return { branches, type: DescriptorType.Choice };
        }
        else if (directive.type == DirectiveType.For)
        {
            const { left, right, operator } = this.tryParseExpression(parseForLoopStatement, directive.expression, directive.source);

            const fragment    = this.parseTemplate(template);
            const observables = ObserverVisitor.observe(right);

            const loopDescriptor: Descriptor =
            {
                fragment,
                left,
                observables,
                operator,
                right,
                source:  directive.source,
                stackTrace,
                type:   DescriptorType.Loop,
            };

            return loopDescriptor;
        }
        else if (directive.type == DirectiveType.Placeholder)
        {
            const keyExpression  = this.tryParseExpression(parseExpression, directive.key.expression, directive.key.source);
            const expression     = this.tryParseExpression(parseExpression, `${directive.scope.expression || "{ }"}`, directive.scope.source);
            const keyObservables = ObserverVisitor.observe(keyExpression);
            const observables    = ObserverVisitor.observe(expression);
            const fragment       = this.parseTemplate(template);

            const placeholderDirective: PlaceholderStatementDescriptor =
            {
                fragment,
                key:         keyExpression,
                observables: { key: keyObservables, value: observables },
                scope:       expression,
                source:      { key: directive.key.source, scope: directive.scope.source },
                stackTrace,
                type:        DescriptorType.Placeholder,
            };

            return placeholderDirective;
        }
        else if (directive.type == DirectiveType.Inject)
        {
            const destructured = /^\s*\{/.test(directive.scope.expression);

            const keyExpression  = this.tryParseExpression(parseExpression, directive.key.expression, directive.key.source);
            const pattern        = this.tryParseExpression(destructured ? parseDestructuredPattern : parseExpression, `${directive.scope.expression || "{ }"}`, directive.scope.source) as IPattern | Identifier;
            const keyObservables = ObserverVisitor.observe(keyExpression);
            const observables    = ObserverVisitor.observe(pattern);

            const fragment = this.parseTemplate(template);

            const injectionDescriptor: InjectionStatementDescriptor =
            {
                fragment,
                key:         keyExpression,
                observables: { key: keyObservables, value: observables },
                scope:       pattern,
                source:      { key: directive.key.source, scope: directive.scope.source },
                stackTrace,
                type:        DescriptorType.Injection,
            };

            return injectionDescriptor;
        }

        assert(directive.type == DirectiveType.Extends);

        if ("metadata" in directive)
        {
            const expression = this.tryParseExpression(parseExpression, directive.metadata.expression, directive.metadata.source);

            return {
                metadata:
                {
                    expression,
                    source: directive.metadata.source,
                },
                stackTrace,
                type: DescriptorType.Extends,
            };
        }

        const attributesExpression = this.tryParseExpression(parseExpression, directive.attributes.expression, directive.attributes.source);
        const bindsExpression      = this.tryParseExpression(parseExpression, directive.binds.expression, directive.binds.source);
        const injectionsExpression = this.tryParseExpression(parseExpression, directive.injections.expression, directive.injections.source);
        const listenersExpression  = this.tryParseExpression(parseExpression, directive.listeners.expression, directive.listeners.source);

        // const attributesObservables = ObserverVisitor.observe(attributesExpression);
        // const bindsObservables = ObserverVisitor.observe(bindsExpression);
        // const injectionsObservables = ObserverVisitor.observe(injectionsExpression);
        // const listenersObservables = ObserverVisitor.observe(listenersExpression);

        return {
            attributes:
            {
                expression:  attributesExpression,
                source:      directive.attributes.source,
            },
            binds:
            {
                expression:  bindsExpression,
                source:      directive.binds.source,
            },
            injections:
            {
                expression:  injectionsExpression,
                source:      directive.injections.source,
            },
            listeners:
            {
                expression:  listenersExpression,
                source:      directive.listeners.source,
            },
            stackTrace,
            type: DescriptorType.Extends,
        };
    }

    private parseElement(element: Element, stackTrace: StackTrace): ElementDescriptor
    {
        const descriptor: ElementDescriptor =
        {
            attributes: this.parseAttributes(element, stackTrace),
            childs:     element.nodeName == "SCRIPT" || element.nodeName == "STYLE"
                ? element.textContent
                    ? [{ type: DescriptorType.Text, value: element.textContent }]
                    : []
                : this.enumerateParsedNodes(element),
            tag:  element.nodeName.toLowerCase(),
            type: DescriptorType.Element,
        };

        return descriptor;
    }

    private parseTemplate(template: HTMLTemplateElement): FragmentDescriptor
    {
        return new Parser(this.document, this.name, this.stackTrace).parse(template);
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
                type:   DescriptorType.TextInterpolation,
                value:  expression,
            };

            return descriptor;
        }

        const descriptor: Descriptor =
        {
            type:  DescriptorType.Text,
            value: scapeBrackets(node.nodeValue!),
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

    private removeDirectives(template: HTMLTemplateElement, directive: Directive): void
    {
        template.removeAttribute(directive.name);

        if (directive.type == DirectiveType.Extends)
        {
            template.removeAttribute(DirectiveType.ExtendsAttributes);
            template.removeAttribute(DirectiveType.ExtendsBinds);
            template.removeAttribute(DirectiveType.ExtendsInjections);
            template.removeAttribute(DirectiveType.ExtendsListeners);
        }
        else if (directive.type == DirectiveType.Inject || directive.type == DirectiveType.Placeholder)
        {
            template.removeAttribute(`${directive.type}.key`);
            template.removeAttribute(`${directive.type}.scope`);
        }
    }

    private trimContent(content: DocumentFragment): void
    {
        if (content.firstChild && content.firstChild != content.firstElementChild)
        {
            while (content.firstChild.nodeType == NodeType.Text && content.firstChild.textContent!.trim() == "")
            {
                content.firstChild.remove();
            }
        }

        if (content.lastChild && content.lastChild != content.lastElementChild)
        {
            while (content.lastChild.nodeType == NodeType.Text && content.lastChild.textContent!.trim() == "")
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
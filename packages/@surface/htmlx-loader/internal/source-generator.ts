/* eslint-disable max-lines-per-function */
import { deepMerge }                                                                        from "@surface/core";
import type { IExpression, IPattern }                                                       from "@surface/expression";
import { TypeGuard }                                                                        from "@surface/expression";
import { DescriptorType, Parser }                                                           from "@surface/htmlx-parser";
import type { AttributeBindDescritor, BranchDescriptor, Descriptor, RawAttributeDescritor } from "@surface/htmlx-parser";
import jsdom                                                                                from "jsdom";
import { defaultAttributeHandlers }                                                         from "./attribute-handlers.js";
import ScopeRewriterVisitor                                                                 from "./scope-rewriter-visitor.js";
import type { AttributeHandlers }                                                           from "./types/index.js";

const factoryMap: Record<Descriptor["type"], string> =
{
    [DescriptorType.Choice]:            "createChoiceFactory",
    [DescriptorType.Comment]:           "createCommentFactory",
    [DescriptorType.Element]:           "createElementFactory",
    [DescriptorType.Extends]:           "createExtendsFactory",
    [DescriptorType.Fragment]:          "createFragmentFactory",
    [DescriptorType.Injection]:         "createInjectionFactory",
    [DescriptorType.Loop]:              "createLoopFactory",
    [DescriptorType.Placeholder]:       "createPlaceholderFactory",
    [DescriptorType.Text]:              "createTextNodeFactory",
    [DescriptorType.TextInterpolation]: "createTextNodeInterpolationFactory",
};

const attributeFactoryMap: Record<Exclude<AttributeBindDescritor["type"], DescriptorType.Attribute>, string> =
{
    [DescriptorType.Directive]:     "createDirectiveFactory",
    [DescriptorType.Event]:         "createEventFactory",
    [DescriptorType.Interpolation]: "createInterpolationFactory",
    [DescriptorType.Oneway]:        "createOnewayFactory",
    [DescriptorType.Twoway]:        "createTwowayFactory",
};

export default class SourceGenerator
{
    private readonly lines: string[] = [];
    private readonly attributeHandlers: AttributeHandlers;
    private indentationLevel: number = 0;

    private readonly factories: Set<string> = new Set();

    private constructor(attributeHandlers: AttributeHandlers, private readonly generateStackStrace: boolean)
    {
        this.attributeHandlers = deepMerge([attributeHandlers, defaultAttributeHandlers]);
    }

    public static generate(name: string, template: string, attributeHandlers: AttributeHandlers, generateStackStrace: boolean): string
    {
        const descriptor = Parser.parse(new jsdom.JSDOM().window.document, name, template);

        return new SourceGenerator(attributeHandlers, generateStackStrace).generate(descriptor);
    }

    private increaseIndent(): void
    {
        this.indentationLevel++;
    }

    private decreaseIndent(): void
    {
        this.indentationLevel--;
    }

    private writeLine(value: string): void
    {
        this.lines.push("\t".repeat(this.indentationLevel) + value);
    }

    private write(value: string): void
    {
        this.lines[this.lines.length - 1] += value;
    }

    private eraseLine(): void
    {
        this.lines.pop();
    }

    private separateAttributes(descriptors: Iterable<AttributeBindDescritor>): { attributes: RawAttributeDescritor[], directives: Exclude<AttributeBindDescritor, RawAttributeDescritor>[] }
    {
        const attributes: RawAttributeDescritor[]                                  = [];
        const directives: Exclude<AttributeBindDescritor, RawAttributeDescritor>[] = [];

        for (const descriptor of descriptors)
        {
            if (descriptor.type == DescriptorType.Attribute)
            {
                attributes.push(descriptor);
            }
            else
            {
                directives.push(descriptor);
            }
        }

        return { attributes, directives };
    }

    private writeAttributeBinds(tag: string, descriptors: Iterable<AttributeBindDescritor>): void
    {
        const binds = this.separateAttributes(descriptors);

        if (binds.attributes.length > 0)
        {
            this.writeLine("[");
            this.increaseIndent();

            const attributesMap = new Map(binds.attributes.map(x => [x.key, x.value]));

            for (const descriptor of binds.attributes)
            {
                const handler = this.attributeHandlers[tag]?.[descriptor.key];

                if (handler && (!handler.filter || handler.filter(descriptor.key, descriptor.value, attributesMap)))
                {
                    this.writeLine(`["${descriptor.key}", ${handler.resolve(descriptor.key, descriptor.value, attributesMap)}],`);
                }
                else
                {
                    this.writeLine(`["${descriptor.key}", "${descriptor.value}"],`);
                }
            }

            this.decreaseIndent();
            this.writeLine("],");
        }
        else
        {
            this.writeLine("undefined,");
        }

        if (binds.directives.length > 0)
        {
            this.writeLine("[");
            this.increaseIndent();

            for (const descriptor of binds.directives)
            {
                const factory = attributeFactoryMap[descriptor.type];

                this.factories.add(factory);

                this.writeLine(factory);
                this.writeLine("(");
                this.increaseIndent();

                switch (descriptor.type)
                {
                    case DescriptorType.Oneway:
                    case DescriptorType.Interpolation:
                    case DescriptorType.Directive:
                        this.writeLine(`${JSON.stringify(descriptor.key)},`);
                        this.writeLine(`${this.stringifyExpression(descriptor.value)},`);
                        this.writeLine(`${JSON.stringify(descriptor.observables)},`);
                        this.writeLine(this.generateStackStrace ? `${JSON.stringify(descriptor.source)},` : "undefined,");
                        this.writeLine(this.generateStackStrace ? `${JSON.stringify(descriptor.stackTrace)},` : "undefined,");
                        break;
                    case DescriptorType.Event:
                        this.writeLine(`"${descriptor.key}",`);
                        this.writeLine(`${this.stringifyExpression(descriptor.value)},`);
                        this.writeLine(`${this.stringifyExpression(descriptor.context)},`);
                        this.writeLine(this.generateStackStrace ? `${JSON.stringify(descriptor.source)},` : "undefined,");
                        this.writeLine(this.generateStackStrace ? `${JSON.stringify(descriptor.stackTrace)},` : "undefined,");
                        break;
                    case DescriptorType.Twoway:
                    default:
                        this.writeLine(`"${descriptor.left}",`);
                        this.writeLine(`${JSON.stringify(descriptor.right)},`);
                        this.writeLine(this.generateStackStrace ? `${JSON.stringify(descriptor.source)},` : "undefined,");
                        this.writeLine(this.generateStackStrace ? `${JSON.stringify(descriptor.stackTrace)},` : "undefined,");
                        break;
                }

                this.decreaseIndent();
                this.writeLine("),");
            }

            this.decreaseIndent();
            this.writeLine("],");
        }
        else
        {
            this.writeLine("undefined,");
        }
    }

    private writeChilds(descriptors: Iterable<Descriptor>, optional: boolean): void
    {
        let empty = true;

        this.writeLine("[");
        this.increaseIndent();
        for (const descriptor of descriptors)
        {
            empty = false;

            this.writeDescriptor(descriptor);
            this.write(",");
        }
        this.decreaseIndent();
        this.writeLine("]");

        if (empty)
        {
            this.eraseLine();
            this.eraseLine();

            if (optional)
            {
                this.writeLine("undefined");
            }
            else
            {
                this.writeLine("[]");
            }
        }
    }

    private stringifyExpression(expression: IExpression): string
    {
        const scopedExpression = ScopeRewriterVisitor.rewriteExpression(expression);

        return `scope => ${TypeGuard.isObjectExpression(scopedExpression) ? `(${scopedExpression})` : scopedExpression}`;
    }

    private stringifyPattern(pattern: IPattern): string
    {
        if (TypeGuard.isIdentifier(pattern))
        {
            return `(scope, value) => ({ ${pattern.name}: value })`;
        }

        return `(__scope__, __value__) => { const ${ScopeRewriterVisitor.rewritePattern(pattern, "__scope__")} = __value__; return ${ScopeRewriterVisitor.collectScope(pattern)}; }`;
    }

    private generate(descriptor: Descriptor): string
    {
        this.writeLine("const factory =");
        this.increaseIndent();
        this.writeDescriptor(descriptor);
        this.write(";");
        this.decreaseIndent();
        this.writeLine("");
        this.writeLine("export default new TemplateFactory(factory);");

        const statements = this.lines.join("\n");

        this.clear();

        this.writeLine("import");
        this.writeLine("{");
        this.increaseIndent();
        /**/Array.from(this.factories).forEach(x => this.writeLine(`${x},`));
        /**/this.writeLine("TemplateFactory,");
        this.decreaseIndent();
        this.writeLine("} from \"@surface/htmlx\";");
        this.writeLine("");

        const imports = this.lines.join("\n");

        this.clear();

        return `${imports}\n${statements}`;
    }

    private clear(): void
    {
        this.indentationLevel = 0;
        this.lines.length     = 0;
    }

    private writeBranchs(branchs: BranchDescriptor[]): void
    {
        this.writeLine("[");
        this.increaseIndent();

        for (const branch of branchs)
        {
            this.writeLine("[");
            this.increaseIndent();
            /**/this.writeLine(`${this.stringifyExpression(branch.expression)},`);
            /**/this.writeLine(`${JSON.stringify(branch.observables)},`);
            /**/this.writeDescriptor(branch.fragment);
            /**/this.write(",");
            /**/this.writeLine(this.generateStackStrace ? `${JSON.stringify(branch.source)},` : "undefined,");
            /**/this.writeLine(this.generateStackStrace ? `${JSON.stringify(branch.stackTrace)},` : "undefined,");
            /**/this.decreaseIndent();
            this.writeLine("],");
        }

        this.decreaseIndent();
        this.writeLine("]");
    }

    private writeDescriptor(descriptor: Descriptor): void
    {
        const factory = factoryMap[descriptor.type];

        this.factories.add(factory);

        this.writeLine(factory);
        this.writeLine("(");
        this.increaseIndent();
        switch (descriptor.type)
        {
            case DescriptorType.Element:
                this.writeLine(`${JSON.stringify(descriptor.tag)},`);
                this.writeAttributeBinds(descriptor.tag, descriptor.attributes);
                this.writeChilds(descriptor.childs, true);
                this.write(",");
                break;
            case DescriptorType.Comment:
            case DescriptorType.Text:
                this.writeLine(JSON.stringify(descriptor.value));
                break;
            case DescriptorType.TextInterpolation:
                this.writeLine(`${this.stringifyExpression(descriptor.value)},`);
                this.writeLine(`${JSON.stringify(descriptor.observables)},`);
                this.writeLine(this.generateStackStrace ? `${JSON.stringify(descriptor.source)},` : "undefined,");
                this.writeLine(this.generateStackStrace ? `${JSON.stringify(descriptor.stackTrace)},` : "undefined,");
                break;
            case DescriptorType.Choice:
                this.writeBranchs(descriptor.branches);
                break;
            case DescriptorType.Loop:
                this.writeLine(`${this.stringifyPattern(descriptor.left)},`);
                this.writeLine(`${JSON.stringify(descriptor.operator)},`);
                this.writeLine(`${this.stringifyExpression(descriptor.right)},`);
                this.writeLine(`${JSON.stringify(descriptor.observables)},`);
                this.writeDescriptor(descriptor.fragment),
                this.write(","),
                this.writeLine(this.generateStackStrace ? `${JSON.stringify(descriptor.source)},` : "undefined,");
                this.writeLine(this.generateStackStrace ? `${JSON.stringify(descriptor.stackTrace)},` : "undefined,");
                break;
            case DescriptorType.Placeholder:
                this.writeLine(`${this.stringifyExpression(descriptor.key)},`);
                this.writeLine(`${this.stringifyExpression(descriptor.scope)},`);
                this.writeLine(`${JSON.stringify([descriptor.observables.key, descriptor.observables.value])},`);
                this.writeDescriptor(descriptor.fragment);
                this.write(","),
                this.writeLine(this.generateStackStrace ? `${JSON.stringify(descriptor.source)},` : "undefined,");
                this.writeLine(this.generateStackStrace ? `${JSON.stringify(descriptor.stackTrace)},` : "undefined,");
                break;
            case DescriptorType.Injection:
                this.writeLine(`${this.stringifyExpression(descriptor.key)},`);
                this.writeLine(`${this.stringifyPattern(descriptor.scope)},`);
                this.writeLine(`${JSON.stringify([descriptor.observables.key, descriptor.observables.key])},`);
                this.writeDescriptor(descriptor.fragment);
                this.write(","),
                this.writeLine(this.generateStackStrace ? `${JSON.stringify(descriptor.source)},` : "undefined,");
                this.writeLine(this.generateStackStrace ? `${JSON.stringify(descriptor.stackTrace)},` : "undefined,");
                break;
            case DescriptorType.Extends:
                break;
            case DescriptorType.Fragment:
            default:
                this.writeChilds(descriptor.childs, false);
        }

        this.decreaseIndent();
        this.writeLine(")");
    }
}
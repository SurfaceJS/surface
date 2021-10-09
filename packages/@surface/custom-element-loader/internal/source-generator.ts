/* eslint-disable max-lines-per-function */
import CustomElementParser                                                                  from "@surface/custom-element-parser";
import type { AttributeBindDescritor, BranchDescriptor, Descriptor, RawAttributeDescritor } from "@surface/custom-element-parser";
import type { IExpression, IPattern }                                                       from "@surface/expression";
import { TypeGuard }                                                                        from "@surface/expression";
import { JSDOM }                                                                            from "jsdom";
import ScopeRewriterVisitor                                                                 from "./scope-rewriter-visitor.js";

const factoryMap: Record<Descriptor["type"], string> =
{
    "choice-statement":      "createChoiceFactory",
    "comment":               "createCommentFactory",
    "element":               "createElementFactory",
    "fragment":              "createFragmentFactory",
    "injection-statement":   "createInjectionFactory",
    "loop-statement":        "createLoopFactory",
    "placeholder-statement": "createPlaceholderFactory",
    "text":                  "createTextNodeFactory",
    "text-interpolation":    "createTextNodeInterpolationFactory",
};

const attributeFactoryMap: Record<Exclude<AttributeBindDescritor["type"], "raw">, string> =
{
    directive:     "createDirectiveFactory",
    event:         "createEventFactory",
    interpolation: "createInterpolationFactory",
    oneway:        "createOnewayFactory",
    twoway:        "createTwowayFactory",
};

export default class SourceGenerator
{
    private readonly lines: string[] = [];
    private indentationLevel: number = 0;

    private readonly factories: Set<string> = new Set();

    private constructor(private readonly production: boolean)
    { }

    public static generate(name: string, template: string, production: boolean): string
    {
        const descriptor = CustomElementParser.parse(new JSDOM().window.document, name, template);

        return new SourceGenerator(production).generate(descriptor);
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
            if (descriptor.type == "raw")
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

    private writeAttributeBinds(descriptors: Iterable<AttributeBindDescritor>): void
    {
        const binds = this.separateAttributes(descriptors);

        if (binds.attributes.length > 0)
        {
            this.writeLine("[");
            this.increaseIndent();

            for (const descriptor of binds.attributes)
            {

                this.writeLine(`["${descriptor.key}", "${descriptor.value}"],`);
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
                    case "oneway":
                    case "interpolation":
                    case "directive":
                        this.writeLine(`${JSON.stringify(descriptor.key)},`);
                        this.writeLine(`${this.stringifyExpression(descriptor.value)},`);
                        this.writeLine(`${JSON.stringify(descriptor.observables)},`);
                        this.writeLine(!this.production ? `${JSON.stringify(descriptor.source)},` : "undefined,");
                        this.writeLine(!this.production ? `${JSON.stringify(descriptor.stackTrace)},` : "undefined,");
                        break;
                    case "event":
                        this.writeLine(`"${descriptor.key}",`);
                        this.writeLine(`${this.stringifyExpression(descriptor.value)},`);
                        this.writeLine(`${this.stringifyExpression(descriptor.context)},`);
                        this.writeLine(!this.production ? `${JSON.stringify(descriptor.source)},` : "undefined,");
                        this.writeLine(!this.production ? `${JSON.stringify(descriptor.stackTrace)},` : "undefined,");
                        break;
                    case "twoway":
                    default:
                        this.writeLine(`"${descriptor.left}",`);
                        this.writeLine(`${JSON.stringify(descriptor.right)},`);
                        this.writeLine(!this.production ? `${JSON.stringify(descriptor.source)},` : "undefined,");
                        this.writeLine(!this.production ? `${JSON.stringify(descriptor.stackTrace)},` : "undefined,");
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
        return `scope => ${ScopeRewriterVisitor.rewrite(expression)}`;
    }

    private stringifyPattern(pattern: IPattern): string
    {
        if (TypeGuard.isIdentifier(pattern))
        {
            return `scope => ({ ${pattern.name}: scope })`;
        }

        return `scope => { const ${pattern} = scope; return ${ScopeRewriterVisitor.collectScope(pattern)}; }`;
    }

    private generate(descriptor: Descriptor): string
    {
        this.writeLine("const factory =");
        this.increaseIndent();
        this.writeDescriptor(descriptor);
        this.write(";");
        this.decreaseIndent();
        this.writeLine("");
        this.writeLine("export default factory;");

        const statements = this.lines.join("\n");

        this.clear();

        this.writeLine("import");
        this.writeLine("{");
        this.increaseIndent();
        Array.from(this.factories).forEach(x => this.writeLine(`${x},`));
        this.decreaseIndent();
        this.writeLine("} from \"@surface/custom-element\";");
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
            this.writeLine("{");
            this.increaseIndent();
            /**/this.writeLine(`expression: ${this.stringifyExpression(branch.expression)},`);
            /**/this.writeLine("fragment:");
            /*    */this.increaseIndent();
            /*    */this.writeDescriptor(branch.fragment);
            /*    */this.write(",");
            /*    */this.decreaseIndent();
            /**/this.writeLine(`observables: ${JSON.stringify(branch.observables)},`);
            /**/this.writeLine(!this.production ? `source: ${JSON.stringify(branch.source)},` : "undefined");
            /**/this.writeLine(!this.production ? `stackTrace: ${JSON.stringify(branch.stackTrace)},` : "undefined");
            /**/this.decreaseIndent();
            this.writeLine("},");
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
            case "element":
                this.writeLine(`${JSON.stringify(descriptor.tag)},`);
                this.writeAttributeBinds(descriptor.attributes);
                this.writeChilds(descriptor.childs, true);
                this.write(",");
                break;
            case "comment":
            case "text":
                this.writeLine(JSON.stringify(descriptor.value));
                break;
            case "text-interpolation":
                this.writeLine(`${this.stringifyExpression(descriptor.value)},`);
                this.writeLine(`${JSON.stringify(descriptor.observables)},`);
                this.writeLine(!this.production ? `${JSON.stringify(descriptor.source)},` : "undefined,");
                this.writeLine(!this.production ? `${JSON.stringify(descriptor.stackTrace)},` : "undefined,");
                break;
            case "choice-statement":
                this.writeBranchs(descriptor.branches);
                break;
            case "loop-statement":
                this.writeLine(`${this.stringifyPattern(descriptor.left)},`);
                this.writeLine(`${JSON.stringify(descriptor.operator)},`);
                this.writeLine(`${this.stringifyExpression(descriptor.right)},`);
                this.writeLine(`${JSON.stringify(descriptor.observables)},`);
                this.writeDescriptor(descriptor.fragment),
                this.write(","),
                this.writeLine(!this.production ? `${JSON.stringify(descriptor.source)},` : "undefined,");
                this.writeLine(!this.production ? `${JSON.stringify(descriptor.stackTrace)},` : "undefined,");
                break;
            case "placeholder-statement":
                this.writeLine(`${this.stringifyExpression(descriptor.key)},`);
                this.writeLine(`${this.stringifyExpression(descriptor.value)},`);
                this.writeLine(`${JSON.stringify([descriptor.observables.key, descriptor.observables.value])},`);
                this.writeDescriptor(descriptor.fragment);
                this.write(","),
                this.writeLine(!this.production ? `${JSON.stringify(descriptor.source)},` : "undefined,");
                this.writeLine(!this.production ? `${JSON.stringify(descriptor.stackTrace)},` : "undefined,");
                break;
            case "injection-statement":
                this.writeLine(`${this.stringifyExpression(descriptor.key)},`);
                this.writeLine(`${this.stringifyPattern(descriptor.value)},`);
                this.writeLine(`${JSON.stringify([descriptor.observables.key, descriptor.observables.key])},`);
                this.writeDescriptor(descriptor.fragment);
                this.write(","),
                this.writeLine(!this.production ? `${JSON.stringify(descriptor.source)},` : "undefined,");
                this.writeLine(!this.production ? `${JSON.stringify(descriptor.stackTrace)},` : "undefined,");
                break;
            case "fragment":
            default:
                this.writeChilds(descriptor.childs, false);
        }

        this.decreaseIndent();
        this.writeLine(")");
    }
}
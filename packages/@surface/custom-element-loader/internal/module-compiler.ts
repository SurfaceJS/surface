import TemplateParser                  from "@surface/custom-element/internal/parsers/template-parser.js";
import type Descriptor                 from "@surface/custom-element/internal/types/descriptor";
import type { AttributeBindDescritor } from "@surface/custom-element/internal/types/descriptor";
import type { IExpression, IPattern }  from "@surface/expression";
import { JSDOM }                       from "jsdom";

const CREATE_ELEMENT_FACTORY   = "createElementFactory";
const CREATE_FRAGMENT_FACTORY  = "createFragmentFactory";
const CREATE_TEXT_NODE_FACTORY = "createTextNodeFactory";

const fatoryMap: Record<Exclude<AttributeBindDescritor["type"], "raw">, string> =
{
    directive:     "createDirectiveFactory",
    event:         "createEventFactory",
    interpolation: "createInterpolationFactory",
    oneway:        "createOnewayFactory",
    twoway:        "createTwowayFactory",
};

export default class ModuleCompiler
{
    private identationLevel: number = 0;

    private readonly factories: Set<string> = new Set();

    private constructor(private readonly production: boolean)
    { }

    public static compile(name: string, template: string, production: boolean): string
    {
        const descriptor = TemplateParser.parse(new JSDOM().window.document, name, template);

        return new ModuleCompiler(production).compile(descriptor);
    }

    private getIndentation(): string
    {
        return "\t".repeat(this.identationLevel);
    }

    private stringifyAttributeBinds(descriptors: Iterable<AttributeBindDescritor>): { attributes: string[], directives: string[] }
    {
        const directives: string[] = [];
        const attributes: string[] = [];

        for (const descriptor of descriptors)
        {
            if (descriptor.type == "raw")
            {
                this.identationLevel++;

                attributes.push(`${this.getIndentation()}["${descriptor.key}", "${descriptor.value}"]`);

                this.identationLevel--;
            }
            else
            {
                this.identationLevel++;

                const identation = this.getIndentation();

                this.identationLevel++;

                const identation2x = this.getIndentation();

                const factory = fatoryMap[descriptor.type];

                switch (descriptor.type)
                {
                    case "oneway":
                    case "interpolation":
                    case "directive":
                        {
                            this.factories.add(factory);

                            const source =
                            [
                                `${identation}${factory}`,
                                `${identation}(`,
                                `${identation2x}"${descriptor.key}",`,
                                `${identation2x}${this.stringifyExpression(descriptor.value)},`,
                                `${identation2x}${JSON.stringify(descriptor.observables)},`,
                                !this.production ? `${identation2x}${JSON.stringify(descriptor.source)},` : undefined,
                                !this.production ? `${identation2x}${JSON.stringify(descriptor.stackTrace)},` : undefined,
                                `${identation})`,
                            ].filter(x => !!x).join("\n");

                            directives.push(source);
                        }
                        break;
                    case "event":
                        {
                            this.factories.add(factory);

                            const source =
                            [
                                `${identation}${factory}`,
                                `${identation}(`,
                                `${identation2x}"${descriptor.key}",`,
                                `${identation2x}${this.stringifyExpression(descriptor.value)},`,
                                `${identation2x}${this.stringifyExpression(descriptor.context)},`,
                                !this.production ? `${identation2x}${JSON.stringify(descriptor.source)},` : undefined,
                                !this.production ? `${identation2x}${JSON.stringify(descriptor.stackTrace)},` : undefined,
                                `${identation})`,
                            ].filter(x => !!x).join("\n");

                            directives.push(source);
                        }
                        break;
                    case "twoway":
                        {
                            this.factories.add(factory);

                            const source =
                            [
                                `${identation}${factory}`,
                                `${identation}(`,
                                `${identation2x}"${descriptor.left}",`,
                                `${identation2x}${JSON.stringify(descriptor.right)},`,
                                !this.production ? `${identation2x}${JSON.stringify(descriptor.source)},` : undefined,
                                !this.production ? `${identation2x}${JSON.stringify(descriptor.stackTrace)},` : undefined,
                                `${identation})`,
                            ].filter(x => !!x).join("\n");

                            directives.push(source);
                        }
                        break;
                    default:
                        break;
                }

                this.identationLevel -= 2;
            }
        }

        return { attributes, directives };
    }

    private stringifyChilds(childs: Iterable<Descriptor>, optional: false): string;
    private stringifyChilds(childs: Iterable<Descriptor>, optional: true): string | undefined;
    private stringifyChilds(childs: Iterable<Descriptor>, optional: boolean): string | undefined
    {
        const factories: string[] = [];

        this.identationLevel++;

        for (const child of childs)
        {
            factories.push(this.stringifyDescriptor(child));
        }

        let result: string | undefined;

        const indentation = this.getIndentation();

        if (factories.length > 0)
        {
            result = `${indentation}[\n`;

            result += `${`${factories.join(",\n")}\n${indentation}`}]`;
        }
        else if (!optional)
        {
            result = `${indentation}[]`;
        }

        this.identationLevel--;

        return result;
    }

    private stringifyExpression(expression: IExpression): string
    {
        return `scope => { with (scope) { return ${expression}; }`;
    }

    private stringifyPattern(expression: IPattern): string
    {
        return `scope => { with (scope) { return ${expression}; }`;
    }

    private compile(descriptor: Descriptor): string
    {
        const factory = this.stringifyDescriptor(descriptor);

        return [
            `import {\n${Array.from(this.factories).map(x => `\t${x}`).join(",\n")}\n} from "@surface/custom-element/factories";`,
            "const factory =",
            `${factory};`,
            "export default factory;",
        ].join("\n");
    }

    private stringifyArray(source: string[], hasSimbling: boolean): string | undefined
    {
        const identation = "\t".repeat(this.identationLevel);

        if (source.length > 0)
        {
            return `${identation}[\n${source.join(",\n")}\n${identation}],`;
        }
        else if (hasSimbling)
        {
            return `${identation}void 0,`;
        }

        return undefined;
    }

    private stringifyDescriptor(descriptor: Descriptor): string
    {
        let source: string;

        this.identationLevel++;

        switch (descriptor.type)
        {
            case "element":
                {
                    this.factories.add(CREATE_ELEMENT_FACTORY);

                    const identation = "\t".repeat(this.identationLevel);

                    this.identationLevel++;

                    const binds  = this.stringifyAttributeBinds(descriptor.attributes);
                    const childs = this.stringifyChilds(descriptor.childs, true);

                    const identation2x = "\t".repeat(this.identationLevel);

                    source =
                    [
                        identation + CREATE_ELEMENT_FACTORY,
                        `${identation}(`,
                        `${identation2x}"${descriptor.tag}",`,
                        this.stringifyArray(binds.attributes, binds.directives.length > 0 || !!childs),
                        this.stringifyArray(binds.directives, !!childs),
                        childs,
                        `${identation})`,
                    ].filter(x => !!x).join("\n");

                    this.identationLevel--;
                }
                break;
            case "text":
                this.factories.add(CREATE_TEXT_NODE_FACTORY);

                source = `${"\t".repeat(this.identationLevel)}${CREATE_TEXT_NODE_FACTORY}("${descriptor.value}")`;
                break;
            case "text-interpolation":
                source = "";
                break;
            case "choice-statement":
                source = "";
                break;
            case "loop-statement":
                source = [
                    "createLoopFactory(",
                    this.stringifyPattern(descriptor.left),
                    `"${descriptor.operator}"`,
                    this.stringifyExpression(descriptor.right),
                    descriptor.observables,
                    this.compile(descriptor.fragment),
                    this.production ? `"${descriptor.source}"` : undefined,
                    this.production ? JSON.stringify(descriptor.stackTrace) : undefined,
                    ")",
                ].filter(x => !!x).join(",");
                break;
            case "placeholder-statement":
                source = "";
                break;
            case "injection-statement":
                source = "";
                break;
            case "comment":
                this.factories.add("createComment");

                source = "";
                break;
            case "fragment":
            default:
            {
                this.factories.add(CREATE_FRAGMENT_FACTORY);

                const identation = "\t".repeat(this.identationLevel);

                source =
                [
                    `${identation}${CREATE_FRAGMENT_FACTORY}`,
                    `${identation}(`,
                    this.stringifyChilds(descriptor.childs, false),
                    `${identation})`,
                ].filter(x => !!x.trim()).join("\n");
            }
        }

        this.identationLevel--;

        return source;
    }
}
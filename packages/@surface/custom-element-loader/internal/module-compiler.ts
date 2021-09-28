/* eslint-disable max-lines-per-function */
import TemplateParser                  from "@surface/custom-element/internal/parsers/template-parser.js";
import type Descriptor                 from "@surface/custom-element/internal/types/descriptor";
import type { AttributeBindDescritor, BranchDescriptor } from "@surface/custom-element/internal/types/descriptor";
import type { IExpression, IPattern }  from "@surface/expression";
import { JSDOM }                       from "jsdom";

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

    private getIdentation(): string
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

                attributes.push(`${this.getIdentation()}["${descriptor.key}", "${descriptor.value}"]`);

                this.identationLevel--;
            }
            else
            {
                this.identationLevel++;

                const identation = this.getIdentation();

                this.identationLevel++;

                const identation2x = this.getIdentation();

                const factory = attributeFactoryMap[descriptor.type];

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

        const indentation = this.getIdentation();

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
        return `scope => ${expression}`;
    }

    private stringifyPattern(expression: IPattern): string
    {
        return `scope => ${expression}`;
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
        const identation = this.getIdentation();

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

    private stringifyBranchs(branchs: BranchDescriptor[]): string
    {
        this.identationLevel++;

        const identation = this.getIdentation();

        this.identationLevel++;

        const identation2x = this.getIdentation();

        this.identationLevel++;

        const identation3x = this.getIdentation();

        const sourceBraches = [`${identation}[`];

        for (const branch of branchs)
        {
            const source =
            [
                `${identation2x}{`,
                `${identation3x}expression: ${this.stringifyExpression(branch.expression)},`,
                `${identation3x}fragment:`,
                `${this.stringifyDescriptor(branch.fragment)},`,
                `${identation3x}observables: ${JSON.stringify(branch.observables)},`,
                !this.production ? `${identation3x}source: ${JSON.stringify(branch.source)},` : undefined,
                !this.production ? `${identation3x}stackTrace: ${JSON.stringify(branch.stackTrace)},` : undefined,
                `${identation2x}},`,
            ].filter(x => !!x).join("\n");

            sourceBraches.push(source);
        }

        sourceBraches.push(`${identation}]`);

        this.identationLevel -= 3;

        return sourceBraches.join("\n");
    }

    private stringifyDescriptor(descriptor: Descriptor): string
    {
        let source: string;

        this.identationLevel++;

        const factory    = factoryMap[descriptor.type];
        const identation = this.getIdentation();

        this.factories.add(factory);

        switch (descriptor.type)
        {
            case "element":
                {
                    const childs = this.stringifyChilds(descriptor.childs, true);

                    this.identationLevel++;

                    const binds  = this.stringifyAttributeBinds(descriptor.attributes);

                    const identation2x = this.getIdentation();

                    source =
                    [
                        identation + factory,
                        `${identation}(`,
                        `${identation2x}${JSON.stringify(descriptor.tag)},`,
                        this.stringifyArray(binds.attributes, binds.directives.length > 0 || !!childs),
                        this.stringifyArray(binds.directives, !!childs),
                        childs,
                        `${identation})`,
                    ].filter(x => !!x).join("\n");

                    this.identationLevel--;
                }
                break;
            case "text":
                source = `${identation}${factory}("${descriptor.value}")`;
                break;
            case "text-interpolation":
                {
                    this.identationLevel++;

                    const identation2x = this.getIdentation();

                    source =
                    [
                        identation + factory,
                        `${identation}(`,
                        `${identation2x}${this.stringifyExpression(descriptor.value)},`,
                        `${identation2x}${JSON.stringify(descriptor.observables)},`,
                        !this.production ? `${identation2x}${JSON.stringify(descriptor.source)},` : undefined,
                        !this.production ? `${identation2x}${JSON.stringify(descriptor.stackTrace)},` : undefined,
                        `${identation})`,
                    ].filter(x => !!x).join("\n");

                    this.identationLevel--;
                }
                break;
            case "choice-statement":
                source =
                [
                    identation + factory,
                    `${identation}(`,
                    this.stringifyBranchs(descriptor.branches),
                    `${identation})`,
                ].filter(x => !!x).join("\n");
                break;
            case "loop-statement":
                {
                    const fragment = this.stringifyDescriptor(descriptor.fragment);

                    this.identationLevel++;

                    const identation2x = this.getIdentation();

                    source =
                    [
                        identation + factory,
                        `${identation}(`,
                        `${identation2x}${this.stringifyPattern(descriptor.left)},`,
                        `${identation2x}${JSON.stringify(descriptor.operator)},`,
                        `${identation2x}${this.stringifyExpression(descriptor.right)},`,
                        `${identation2x}${JSON.stringify(descriptor.observables)},`,
                        `${fragment},`,
                        !this.production ? `${identation2x}${JSON.stringify(descriptor.source)},` : undefined,
                        !this.production ? `${identation2x}${JSON.stringify(descriptor.stackTrace)},` : undefined,
                        `${identation})`,
                    ].filter(x => !!x).join("\n");

                    this.identationLevel--;
                }
                break;
            case "placeholder-statement":
                {
                    const fragment = this.stringifyDescriptor(descriptor.fragment);

                    this.identationLevel++;

                    const identation2x = this.getIdentation();

                    source =
                    [
                        identation + factory,
                        `${identation}(`,
                        `${identation2x}${this.stringifyExpression(descriptor.key)},`,
                        `${identation2x}${this.stringifyExpression(descriptor.value)},`,
                        `${identation2x}${JSON.stringify(descriptor.observables)},`,
                        `${fragment},`,
                        !this.production ? `${identation2x}${JSON.stringify(descriptor.source)},` : undefined,
                        !this.production ? `${identation2x}${JSON.stringify(descriptor.stackTrace)},` : undefined,
                        `${identation})`,
                    ].filter(x => !!x).join("\n");

                    this.identationLevel--;
                }
                break;
            case "injection-statement":
                {
                    const fragment = this.stringifyDescriptor(descriptor.fragment);

                    this.identationLevel++;

                    const identation2x = this.getIdentation();

                    source =
                    [
                        identation + factory,
                        `${identation}(`,
                        `${identation2x}${this.stringifyExpression(descriptor.key)},`,
                        `${identation2x}${this.stringifyPattern(descriptor.value)},`,
                        `${identation2x}${JSON.stringify(descriptor.observables)},`,
                        `${fragment},`,
                        !this.production ? `${identation2x}${JSON.stringify(descriptor.source)},` : undefined,
                        !this.production ? `${identation2x}${JSON.stringify(descriptor.stackTrace)},` : undefined,
                        `${identation})`,
                    ].filter(x => !!x).join("\n");

                    this.identationLevel--;
                }
                break;
            case "comment":
                source = "";
                break;
            case "fragment":
            default:
                source =
                [
                    `${identation}${factory}`,
                    `${identation}(`,
                    this.stringifyChilds(descriptor.childs, false),
                    `${identation})`,
                ].filter(x => !!x.trim()).join("\n");
        }

        this.identationLevel--;

        return source;
    }
}
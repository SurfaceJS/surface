import choiceFactory               from "./factories/choice-factory.js";
import commentFactory              from "./factories/comment-factory.js";
import directiveFactory            from "./factories/directive-factory.js";
import elementFactory              from "./factories/element-factory.js";
import eventFactory                from "./factories/event-factory.js";
import fragmentFactory             from "./factories/fragment-factory.js";
import injectionFactory            from "./factories/injection-factory.js";
import interpolationFactory        from "./factories/interpolation-factory.js";
import loopFactory                 from "./factories/loop-factory.js";
import onewayFactory               from "./factories/oneway-factory.js";
import placeholderFactory          from "./factories/placeholder-factory.js";
import textNodeFactory             from "./factories/text-node-factory.js";
import twowayFactory               from "./factories/twoway-factory.js";
import TemplateParser              from "./template-parser.js";
import type AttributeFactory       from "./types/attribute-fatctory.js";
import type Descriptor             from "./types/descriptor.js";
import type { AttributeDescritor } from "./types/descriptor.js";
import type NodeFactory            from "./types/node-fatctory.js";

export default class TemplateCompiler
{
    private static mapAttributes(attributes: Iterable<AttributeDescritor>): [[string, string][], AttributeFactory[]]
    {
        const rawattributes: [string, string][] = [];
        const factories:     AttributeFactory[] = [];

        for (const attribute of attributes)
        {
            switch (attribute.type)
            {
                case "raw":
                    rawattributes.push([attribute.key, attribute.value]);
                    break;
                case "directive":
                    factories.push(directiveFactory(attribute.key, scope => attribute.value.evaluate(scope), attribute.observables));
                    break;
                case "event":
                    factories.push(eventFactory(attribute.key, scope => attribute.value.evaluate(scope)));
                    break;
                case "interpolation":
                    factories.push(interpolationFactory(attribute.key, scope => attribute.value.evaluate(scope), attribute.observables));
                    break;
                case "oneway":
                    factories.push(onewayFactory(attribute.key, scope => attribute.value.evaluate(scope), attribute.observables));
                    break;
                case "twoway":
                    factories.push(twowayFactory(attribute.left, attribute.right));
                    break;
                default:
                    break;
            }
        }

        return [rawattributes, factories];
    }

    private static mapChilds(childs: Iterable<Descriptor>): NodeFactory[]
    {
        const factories: NodeFactory[] = [];

        for (const child of childs)
        {
            factories.push(TemplateCompiler.compileDescriptor(child));
        }

        return factories;
    }

    private static compileDescriptor(descriptor: Descriptor): NodeFactory
    {
        switch (descriptor.type)
        {
            case "element":
                return elementFactory
                (
                    descriptor.tag,
                    ...TemplateCompiler.mapAttributes(descriptor.attributes),
                    TemplateCompiler.mapChilds(descriptor.childs),
                );
            case "text":
                return textNodeFactory
                (
                    scope => String(descriptor.value.evaluate(scope)),
                    descriptor.observables,
                );
            case "choice-statement":
                return choiceFactory
                (
                    descriptor.branches.map(x => [scope => x.expression.evaluate(scope), x.observables, TemplateCompiler.compileDescriptor(x.fragment)]),
                );
            case "loop-statement":
                return loopFactory
                (
                    (scope, value) => descriptor.left.evaluate(scope, value) as object,
                    descriptor.operator,
                    scope => descriptor.right.evaluate(scope),
                    descriptor.observables,
                    TemplateCompiler.compileDescriptor(descriptor.fragment),
                );
            case "placeholder-statement":
                return placeholderFactory
                (
                    scope => String(descriptor.key.evaluate(scope)),
                    scope => descriptor.value.evaluate(scope),
                    [descriptor.observables.key, descriptor.observables.value],
                    TemplateCompiler.compileDescriptor(descriptor.fragment),
                );
            case "injection-statement":
                return injectionFactory
                (
                    scope => String(descriptor.key.evaluate(scope)),
                    (scope, value) => descriptor.value.evaluate(scope, value),
                    [descriptor.observables.key, descriptor.observables.value],
                    TemplateCompiler.compileDescriptor(descriptor.fragment),
                );
            case "comment":
                return commentFactory(descriptor.value);
            case "fragment":
            default:
                return fragmentFactory
                (
                    TemplateCompiler.mapChilds(descriptor.childs),
                );
        }
    }

    public static compile(name: string, template: string): NodeFactory
    {
        const descriptor = TemplateParser.parse(name, template);

        return TemplateCompiler.compileDescriptor(descriptor);
    }
}
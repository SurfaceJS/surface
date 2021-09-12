import createChoiceFactory                from "../factories/create-choice-factory.js";
import createCommentFactory               from "../factories/create-comment-factory.js";
import createDirectiveFactory             from "../factories/create-directive-factory.js";
import createElementFactory               from "../factories/create-element-factory.js";
import createEventFactory                 from "../factories/create-event-factory.js";
import createFragmentFactory              from "../factories/create-fragment-factory.js";
import createInjectionFactory             from "../factories/create-injection-factory.js";
import createInterpolationFactory         from "../factories/create-interpolation-factory.js";
import createLoopFactory                  from "../factories/create-loop-factory.js";
import createOnewayFactory                from "../factories/create-oneway-factory.js";
import createPlaceholderFactory           from "../factories/create-placeholder-factory.js";
import createTextNodeFactory              from "../factories/create-text-node-factory.js";
import createTextNodeInterpolationFactory from "../factories/create-text-node-interpolation-factory.js";
import createTwowayFactory                from "../factories/create-twoway-factory.js";
import TemplateParser                     from "../parsers/template-parser.js";
import type AttributeFactory              from "../types/attribute-fatctory.js";
import type Descriptor                    from "../types/descriptor.js";
import type { AttributeDescritor }        from "../types/descriptor.js";
import type NodeFactory                   from "../types/node-fatctory.js";

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
                    factories.push(createDirectiveFactory(attribute.key, scope => attribute.value.evaluate(scope), attribute.observables, attribute.source, attribute.stackTrace));
                    break;
                case "event":
                    factories.push(createEventFactory(attribute.key, scope => attribute.value.evaluate(scope), scope => attribute.context?.evaluate(scope), attribute.source, attribute.stackTrace));
                    break;
                case "interpolation":
                    factories.push(createInterpolationFactory(attribute.key, scope => attribute.value.evaluate(scope), attribute.observables, attribute.source, attribute.stackTrace));
                    break;
                case "oneway":
                    factories.push(createOnewayFactory(attribute.key, scope => attribute.value.evaluate(scope), attribute.observables, attribute.source, attribute.stackTrace));
                    break;
                case "twoway":
                    factories.push(createTwowayFactory(attribute.left, attribute.right, attribute.source, attribute.stackTrace));
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
                return createElementFactory
                (
                    descriptor.tag,
                    ...TemplateCompiler.mapAttributes(descriptor.attributes),
                    TemplateCompiler.mapChilds(descriptor.childs),
                );
            case "text":
                return createTextNodeFactory(descriptor.value);
            case "text-interpolation":
                return createTextNodeInterpolationFactory
                (
                    scope => descriptor.value.evaluate(scope),
                    descriptor.observables,
                    descriptor.source,
                    descriptor.stackTrace,
                );
            case "choice-statement":
                return createChoiceFactory
                (
                    descriptor.branches.map(x => [scope => x.expression.evaluate(scope), x.observables, TemplateCompiler.compileDescriptor(x.fragment), x.source, x.stackTrace]),
                );
            case "loop-statement":
                return createLoopFactory
                (
                    (scope, value) => descriptor.left.evaluate(scope, value),
                    descriptor.operator,
                    scope => descriptor.right.evaluate(scope),
                    descriptor.observables,
                    TemplateCompiler.compileDescriptor(descriptor.fragment),
                    descriptor.source,
                    descriptor.stackTrace,
                );
            case "placeholder-statement":
                return createPlaceholderFactory
                (
                    scope => descriptor.key.evaluate(scope),
                    scope => descriptor.value.evaluate(scope),
                    [descriptor.observables.key, descriptor.observables.value],
                    TemplateCompiler.compileDescriptor(descriptor.fragment),
                    descriptor.source,
                    descriptor.stackTrace,
                );
            case "injection-statement":
                return createInjectionFactory
                (
                    scope => descriptor.key.evaluate(scope),
                    (scope, value) => descriptor.value.evaluate(scope, value),
                    [descriptor.observables.key, descriptor.observables.value],
                    TemplateCompiler.compileDescriptor(descriptor.fragment),
                    descriptor.source,
                    descriptor.stackTrace,
                );
            case "comment":
                return createCommentFactory(descriptor.value);
            case "fragment":
            default:
                return createFragmentFactory
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
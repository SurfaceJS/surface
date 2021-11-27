import { DescriptorType, Parser }                  from "@surface/htmlx-parser";
import type { AttributeBindDescritor, Descriptor } from "@surface/htmlx-parser";
import createChoiceFactory                         from "./factories/create-choice-factory.js";
import createCommentFactory                        from "./factories/create-comment-factory.js";
import createDirectiveFactory                      from "./factories/create-directive-factory.js";
import createElementFactory                        from "./factories/create-element-factory.js";
import createEventFactory                          from "./factories/create-event-factory.js";
import createFragmentFactory                       from "./factories/create-fragment-factory.js";
import createInjectionFactory                      from "./factories/create-injection-factory.js";
import createInterpolationFactory                  from "./factories/create-interpolation-factory.js";
import createLoopFactory                           from "./factories/create-loop-factory.js";
import createOnewayFactory                         from "./factories/create-oneway-factory.js";
import createPlaceholderFactory                    from "./factories/create-placeholder-factory.js";
import createTextNodeFactory                       from "./factories/create-text-node-factory.js";
import createTextNodeInterpolationFactory          from "./factories/create-text-node-interpolation-factory.js";
import createTwowayFactory                         from "./factories/create-twoway-factory.js";
import TemplateFactory                             from "./template-factory.js";
import type AttributeFactory                       from "./types/attribute-factory.js";
import type NodeFactory                            from "./types/node-factory.js";

export default class Compiler
{
    private static mapAttributes(binds: Iterable<AttributeBindDescritor>): [[string, string][], AttributeFactory[]]
    {
        const attributes: [string, string][] = [];
        const factories:  AttributeFactory[] = [];

        for (const bind of binds)
        {
            switch (bind.type)
            {
                case DescriptorType.Attribute:
                    attributes.push([bind.key, bind.value]);
                    break;
                case DescriptorType.Directive:
                    factories.push(createDirectiveFactory(bind.key, scope => bind.value.evaluate(scope), bind.observables, bind.source, bind.stackTrace));
                    break;
                case DescriptorType.Event:
                    factories.push(createEventFactory(bind.key, scope => bind.value.evaluate(scope), scope => bind.context?.evaluate(scope), bind.source, bind.stackTrace));
                    break;
                case DescriptorType.Interpolation:
                    factories.push(createInterpolationFactory(bind.key, scope => bind.value.evaluate(scope), bind.observables, bind.source, bind.stackTrace));
                    break;
                case DescriptorType.Oneway:
                    factories.push(createOnewayFactory(bind.key, scope => bind.value.evaluate(scope), bind.observables, bind.source, bind.stackTrace));
                    break;
                case DescriptorType.Twoway:
                default:
                    factories.push(createTwowayFactory(bind.left, bind.right, bind.source, bind.stackTrace));
                    break;
            }
        }

        return [attributes, factories];
    }

    private static mapChilds(childs: Iterable<Descriptor>): NodeFactory[]
    {
        const factories: NodeFactory[] = [];

        for (const child of childs)
        {
            factories.push(Compiler.compileDescriptor(child));
        }

        return factories;
    }

    private static compileDescriptor(descriptor: Descriptor): NodeFactory
    {
        switch (descriptor.type)
        {
            case DescriptorType.Element:
                return createElementFactory
                (
                    descriptor.tag,
                    ...Compiler.mapAttributes(descriptor.attributes),
                    Compiler.mapChilds(descriptor.childs),
                );
            case DescriptorType.Text:
                return createTextNodeFactory(descriptor.value);
            case DescriptorType.TextInterpolation:
                return createTextNodeInterpolationFactory
                (
                    scope => descriptor.value.evaluate(scope),
                    descriptor.observables,
                    descriptor.source,
                    descriptor.stackTrace,
                );
            case DescriptorType.Choice:
                return createChoiceFactory
                (
                    descriptor.branches.map(x => [scope => x.expression.evaluate(scope), x.observables, Compiler.compileDescriptor(x.fragment), x.source, x.stackTrace]),
                );
            case DescriptorType.Loop:
                return createLoopFactory
                (
                    (scope, value) => descriptor.left.evaluate(scope, value),
                    descriptor.operator,
                    scope => descriptor.right.evaluate(scope),
                    descriptor.observables,
                    Compiler.compileDescriptor(descriptor.fragment),
                    descriptor.source,
                    descriptor.stackTrace,
                );
            case DescriptorType.Placeholder:
                return createPlaceholderFactory
                (
                    scope => descriptor.key.evaluate(scope),
                    scope => descriptor.scope.evaluate(scope),
                    [descriptor.observables.key, descriptor.observables.value],
                    Compiler.compileDescriptor(descriptor.fragment),
                    descriptor.source,
                    descriptor.stackTrace,
                );
            case DescriptorType.Injection:
                return createInjectionFactory
                (
                    scope => descriptor.key.evaluate(scope),
                    (scope, value) => descriptor.scope.evaluate(scope, value),
                    [descriptor.observables.key, descriptor.observables.value],
                    Compiler.compileDescriptor(descriptor.fragment),
                    descriptor.source,
                    descriptor.stackTrace,
                );
            case DescriptorType.Comment:
                return createCommentFactory(descriptor.value);
            case DescriptorType.Extends:
                return (() => []) as unknown as NodeFactory;
            case DescriptorType.Fragment:
            default:
                return createFragmentFactory
                (
                    Compiler.mapChilds(descriptor.childs),
                );
        }
    }

    public static compile(name: string, template: string): TemplateFactory
    {
        const descriptor = Parser.parse(window.document, name, template);

        const factory = Compiler.compileDescriptor(descriptor);

        return new TemplateFactory(factory);
    }
}
import { hasFlag }                                  from "@surface/core";
import { DescriptorType, Parser, SpreadFlags }      from "@surface/htmlx-parser";
import type { AttributeBindDescriptor, Descriptor } from "@surface/htmlx-parser";
import createChoiceFactory                          from "./factories/create-choice-factory.js";
import createCommentFactory                         from "./factories/create-comment-factory.js";
import createDirectiveFactory                       from "./factories/create-directive-factory.js";
import createElementFactory                         from "./factories/create-element-factory.js";
import createEventListenerFactory                   from "./factories/create-event-listener-factory.js";
import createFragmentFactory                        from "./factories/create-fragment-factory.js";
import createInjectionFactory                       from "./factories/create-injection-factory.js";
import createInterpolationFactory                   from "./factories/create-interpolation-factory.js";
import createLoopFactory                            from "./factories/create-loop-factory.js";
import createOnewayFactory                          from "./factories/create-one-way-factory.js";
import createPlaceholderFactory                     from "./factories/create-placeholder-factory.js";
import createSpreadAttributesFactory                from "./factories/create-spread-attributes-factory.js";
import createSpreadFactory                          from "./factories/create-spread-factory.js";
import createSpreadListenersFactory                 from "./factories/create-spread-listeners.js";
import createSpreadPropertiesFactory                from "./factories/create-spread-properties-factory.js";
import createTextNodeFactory                        from "./factories/create-text-node-factory.js";
import createTextNodeInterpolationFactory           from "./factories/create-text-node-interpolation-factory.js";
import createTwoWayFactory                          from "./factories/create-two-way-factory.js";
import TemplateFactory                              from "./template-factory.js";
import type AttributeFactory                        from "./types/attribute-factory.js";
import type NodeFactory                             from "./types/node-factory.js";
import type SpreadFactory                           from "./types/spread-factory.js";

export default class Compiler
{
    private static mapAttributes(binds: Iterable<AttributeBindDescriptor>): [[string, string][], AttributeFactory[]]
    {
        const attributes: [string, string][] = [];
        const factories:  AttributeFactory[] = [];

        for (const bind of binds)
        {
            switch (bind.type)
            {
                case DescriptorType.Attribute:
                    attributes.push([bind.name, bind.value]);
                    break;
                case DescriptorType.Directive:
                    factories.push(createDirectiveFactory(bind.key, scope => bind.value.evaluate(scope), bind.observables, bind.source, bind.stackTrace));
                    break;
                case DescriptorType.EventListener:
                    factories.push(createEventListenerFactory(bind.name, scope => bind.listener.evaluate(scope), scope => bind.context?.evaluate(scope), bind.source, bind.stackTrace));
                    break;
                case DescriptorType.Interpolation:
                    factories.push(createInterpolationFactory(bind.key, scope => bind.value.evaluate(scope), bind.observables, bind.source, bind.stackTrace));
                    break;
                case DescriptorType.Oneway:
                    factories.push(createOnewayFactory(bind.key, scope => bind.value.evaluate(scope), bind.observables, bind.source, bind.stackTrace));
                    break;
                case DescriptorType.Spread:
                    {
                        const spreadFactories: SpreadFactory[] = [];

                        if (hasFlag(bind.flags, SpreadFlags.Attributes))
                        {
                            spreadFactories.push(createSpreadAttributesFactory);
                        }

                        if (hasFlag(bind.flags, SpreadFlags.Properties))
                        {
                            spreadFactories.push(createSpreadPropertiesFactory);
                        }

                        if (hasFlag(bind.flags, SpreadFlags.Listeners))
                        {
                            spreadFactories.push(createSpreadListenersFactory);
                        }

                        factories.push(createSpreadFactory(scope => bind.expression.evaluate(scope), bind.observables, spreadFactories, bind.source, bind.stackTrace));
                    }
                    break;
                case DescriptorType.TwoWay:
                default:
                    factories.push(createTwoWayFactory(bind.left, bind.right, bind.source, bind.stackTrace));
                    break;
            }
        }

        return [attributes, factories];
    }

    private static mapChildren(children: Iterable<Descriptor>): NodeFactory[]
    {
        const factories: NodeFactory[] = [];

        for (const child of children)
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
                    Compiler.mapChildren(descriptor.children),
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
                    [descriptor.observables.key, descriptor.observables.scope],
                    Compiler.compileDescriptor(descriptor.fragment),
                    descriptor.source,
                    descriptor.stackTrace,
                );
            case DescriptorType.Injection:
                return createInjectionFactory
                (
                    scope => descriptor.key.evaluate(scope),
                    (scope, value) => descriptor.scope.evaluate(scope, value),
                    [descriptor.observables.key, descriptor.observables.scope],
                    Compiler.compileDescriptor(descriptor.fragment),
                    descriptor.source,
                    descriptor.stackTrace,
                );
            case DescriptorType.Comment:
                return createCommentFactory(descriptor.value);
            case DescriptorType.Fragment:
            default:
                return createFragmentFactory
                (
                    Compiler.mapChildren(descriptor.children),
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

import
{
    Constructor,
    Delegate,
    DisposableMetadata,
    HookableMetadata,
    Indexer,
    camelToDashed,
} from "@surface/core";
import ICustomElement from "../interfaces/custom-element";
import Metadata       from "../metadata/metadata";
import StaticMetadata from "../metadata/static-metadata";
import AsyncReactive  from "../reactivity/async-reactive";

function attribute(converter: Delegate<[string], unknown>): (target: ICustomElement, propertyKey: string) => void;
function attribute(target: ICustomElement, propertyKey: string): void;
function attribute(...args: [Delegate<[string], unknown>] | [ICustomElement, string, PropertyDescriptor?]): ((target: ICustomElement, propertyKey: string) => void) | void
{
    const decorator = (target: ICustomElement, propertyKey: string): void =>
    {
        const constructor = target.constructor as Constructor;

        const attributeName = camelToDashed(propertyKey);

        const staticMetadata = StaticMetadata.from(constructor);

        staticMetadata.observedAttributes.push(attributeName);

        if (!constructor.hasOwnProperty("observedAttributes"))
        {
            function get(this: Constructor): string[]
            {
                return StaticMetadata.from(this).observedAttributes;
            }

            Object.defineProperty(target.constructor, "observedAttributes", { get });
        }

        let converter: Delegate<[string], unknown>;

        if (args.length == 1)
        {
            converter = args[0];
        }
        else
        {
            switch (Reflect.getMetadata("design:type", target, propertyKey))
            {
                case Boolean:
                    converter = x => x === "" || x == "true";
                    break;
                case Number:
                    converter = x => Number.parseFloat(x) || 0;
                    break;
                default:
                    converter = x => x;
            }
        }

        staticMetadata.converters[attributeName] = (target: Indexer, value: string) =>
        {
            const current = target[propertyKey];
            const converted = converter(value);

            if (!Object.is(current, converted))
            {
                target[propertyKey] = converted;
            }
        };

        const initializer = (instance: HTMLElement): void =>
        {
            const metadata = Metadata.from(instance);

            const action = (value: unknown): void =>
            {
                metadata.reflectingAttribute.add(attributeName);

                if (typeof value == "boolean")
                {
                    value ? instance.setAttribute(attributeName, "") : instance.removeAttribute(attributeName);
                }
                else
                {
                    instance.setAttribute(attributeName, `${value}`);
                }

                metadata.reflectingAttribute.delete(attributeName);
            };

            const subscription = AsyncReactive.from(instance, [propertyKey]).subscribe(action);

            DisposableMetadata.from(instance).add({ dispose: () => subscription.unsubscribe() });
        };

        HookableMetadata.from(constructor as Constructor<HTMLElement>).finishers.push(initializer);
    };

    if (args.length == 1)
    {
        return decorator;
    }

    const [target, propertyKey] = args;

    decorator(target, propertyKey);
}

export default attribute;

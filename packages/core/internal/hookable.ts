import HookableMetadata     from "./metadata/hookable-metadata.js";
import type { Constructor } from "./types/index.js";

export default class Hookable
{
    public constructor()
    {
        HookableMetadata.from(this.constructor as Constructor).initialize(this);
    }

    public static as<T extends Constructor>(base: T): T & Constructor
    {
        return class HookableExtends extends base
        {

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            public constructor(...args: any[])
            {
                super(...args);

                HookableMetadata.from(this.constructor as Constructor).initialize(this);
            }
        };
    }

    public static finisher<T extends Constructor>(target: T): T
    {
        const metadata = HookableMetadata.from(target);

        if (!metadata.hooked)
        {
            metadata.hooked = true;

            const handler: ProxyHandler<T> =
            {
                construct: (target, args, newTarget) =>
                {
                    const instance = Reflect.construct(target, args, newTarget) as InstanceType<T>;

                    HookableMetadata.from(target).finish(instance);

                    return instance;
                },
            };

            return new Proxy(target, handler);
        }

        return target;
    }
}
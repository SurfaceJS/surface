import { Nullable }    from "@surface/core";
import { SHADOW_ROOT } from "./symbols";

export default class References
{
    private [SHADOW_ROOT]: DocumentFragment;

    public constructor(root: DocumentFragment)
    {
        this[SHADOW_ROOT] = root;

        const handler: ProxyHandler<References> =
        {
            get: (target, key) =>
            {
                if (key in target)
                {
                    return target[key as keyof References];
                }
                else if (typeof key != "symbol")
                {
                    return (target as unknown as Record<string, Nullable<HTMLElement>>)[key] = this[SHADOW_ROOT].getElementById(`${key}`);
                }
                else
                {
                    return undefined;
                }
            },
            has(target, key)
            {
                if (!(key in target))
                {
                    return !!handler.get!(target, key, null);
                }

                return true;
            }
        };

        return new Proxy(this, handler);
    }

    public update(root: DocumentFragment): void
    {
        this[SHADOW_ROOT] = root;
    }
}
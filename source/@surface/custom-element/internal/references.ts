import { Nullable } from "@surface/core";

export default class References
{
    [key: string]: Nullable<HTMLElement>;

    public constructor(shadowRoot: ShadowRoot)
    {
        const handler: ProxyHandler<References> =
        {
            get(target, key)
            {
                if (key in target)
                {
                    return target[key as keyof References];
                }
                else if (typeof key != "symbol")
                {
                    return target[key] = shadowRoot.getElementById(`${key}`);
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
}
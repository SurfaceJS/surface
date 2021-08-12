function queryFactory(fn: (shadowRoot: ShadowRoot) => (Element | null) | NodeListOf<Element>, nocache?: boolean): (target: HTMLElement, propertyKey: string | symbol) => void
{
    return (target: HTMLElement, propertyKey: string | symbol) =>
    {
        const PRIVATE_KEY = Symbol(propertyKey.toString());

        Object.defineProperty
        (
            target,
            propertyKey,
            {
                configurable: true,
                get(this: HTMLElement & { [PRIVATE_KEY]?: (Element | null) | NodeListOf<Element> })
                {
                    if (!this.shadowRoot)
                    {
                        throw Error("Can't query a closed shadow root");
                    }

                    if (!!nocache || Object.is(this[PRIVATE_KEY], undefined))
                    {
                        this[PRIVATE_KEY] = fn(this.shadowRoot);
                    }

                    return this[PRIVATE_KEY] as unknown;
                },
            },
        );
    };
}

/**
 * Injects lazy queried element.
 * @param selector Selector used to element query.
 * @param nocache Specifies whether the element should be cached.
 */
export function query(selector: string, nocache?: boolean): (target: HTMLElement, propertyKey: string | symbol) => void
{
    return queryFactory(x => x.querySelector(selector), nocache);
}

/**
 * Injects all queried element.
 * @param selector Selector used to elements query.
 * @param nocache Specifies whether the elements should be cached.
 */
export function queryAll(selector: string, nocache?: boolean): (target: HTMLElement, propertyKey: string | symbol) => void
{
    return queryFactory(x => x.querySelectorAll(selector), nocache);
}

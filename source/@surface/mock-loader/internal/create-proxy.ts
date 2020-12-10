import Mock from "@surface/mock";

const mocks = new WeakMap<object, Mock<object>>();

function mockFrom(target: object): object
{
    if (Mock.of(target))
    {
        return target;
    }

    let mock = mocks.get(target);

    if (!mock)
    {
        mocks.set(target, mock = new Mock(target));
    }

    return mock.proxy;
}

function proxieFrom(target: object): object
{
    const handler: ProxyHandler<object> =
    {
        get(target, key, receiver)
        {
            const value = Reflect.get(target, key, receiver);

            if (value instanceof Object)
            {
                return mockFrom(value);
            }

            return value;
        },
    };

    return new Proxy(target, handler);
}

export default function createProxy(value: unknown): unknown
{
    if (value && typeof value == "object" || value instanceof Object)
    {
        if (Reflect.get(value, Symbol.toStringTag) == "Module")
        {
            return proxieFrom(value);
        }

        return mockFrom(value);
    }

    return value;
}
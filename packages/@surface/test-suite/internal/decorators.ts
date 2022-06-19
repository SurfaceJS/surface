/* eslint-disable max-lines-per-function */
import Metadata        from "./metadata.js";
import mocha           from "./mocha.js";
import type Test       from "./types/test";
import type TestObject from "./types/test-object";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object>                                = new (...args: any[]) => T;
type Delegate<TArgs extends unknown[] = [], TResult = void> = (...args: TArgs) => TResult;
type Indexer<T = unknown>                                   = object & Record<string | number, T | undefined>;

function camelToText(value: string): string
{
    return value.split(/(?:(?<![A-Z])(?=[A-Z]))|(?:(?<![a-zA-Z])(?=[a-z]))|(?:(?<![0-9])(?=[0-9]))/g).join(" ").toLowerCase();
}

const noop = () => void 0;

export function after(description: string): MethodDecorator;
export function after(target: object, key: string | symbol): void;
export function after(...args: [string] | [object, string | symbol]): MethodDecorator | void
{
    const decorator = (target: TestObject, key: string | symbol, description: string): void =>
    {
        const metadata = Metadata.from(target[key as string]!);

        metadata.after       = true;
        metadata.description = description;
    };

    if (args.length == 1)
    {
        return (target: object, key: string | symbol) => decorator(target as TestObject, key, args[0]);
    }

    const [target, key] = args;

    decorator(target as TestObject, key, camelToText(key.toString()));
}

export function afterEach(description: string): MethodDecorator;
export function afterEach(target: object, key: string | symbol): void;
export function afterEach(...args: [string] | [object, string | symbol]): MethodDecorator | void
{
    const decorator = (target: TestObject, key: string | symbol, description: string): void =>
    {
        const metadata = Metadata.from(target[key as string]!);

        metadata.afterEach   = true;
        metadata.description = description;
    };

    if (args.length == 1)
    {
        return (target: object, key: string | symbol) => decorator(target as TestObject, key, args[0]);
    }

    const [target, key] = args;

    decorator(target as TestObject, key, camelToText(key.toString()));
}

export function batchTest<T = unknown>(source: T[], expectation?: Delegate<[data: T, index: number], string>, skip?: Delegate<[data: T, index: number], boolean>): MethodDecorator;
export function batchTest<T = unknown>(source: T[], expectation?: Delegate<[data: unknown, index: number], string>, skip?: Delegate<[data: unknown, index: number], boolean>): MethodDecorator
{
    return (target: object, key: string | symbol) =>
    {
        const metadata = Metadata.from((target as TestObject)[key as string]!);

        const fallback = camelToText(String(key));

        metadata.batch =
        {
            expectation: expectation ?? ((_, index) => `${fallback}: ${index}`),
            skip:        skip ?? (() => false),
            source,
        };
    };
}

export function before(description: string): MethodDecorator;
export function before(target: object, key: string | symbol): void;
export function before(...args: [string] | [object, string | symbol]): MethodDecorator | void
{
    const decorator = (target: TestObject, key: string | symbol, description: string): void =>
    {
        const metadata = Metadata.from(target[key as string]!);

        metadata.before      = true;
        metadata.description = description;
    };

    if (args.length == 1)
    {
        return (target: object, key: string | symbol) => decorator(target as TestObject, key, args[0]);
    }

    const [target, key] = args;

    decorator(target as TestObject, key, camelToText(key.toString()));
}

export function beforeEach(description: string): MethodDecorator;
export function beforeEach(target: object, propertyKey: string | symbol): void;
export function beforeEach(...args: [string] | [object, string | symbol]): MethodDecorator | void
{
    const decorator = (target: TestObject, key: string | symbol, description: string): void =>
    {
        const metadata = Metadata.from(target[key as string]!);

        metadata.beforeEach  = true;
        metadata.description = description;
    };

    if (args.length == 1)
    {
        return (target: object, key: string | symbol) => decorator(target as TestObject, key.toString(), args[0]);
    }

    const [target, key] = args;

    decorator(target as TestObject, key, camelToText(key.toString()));
}

export function category(name: string): MethodDecorator
{
    return (target: object, key: string | symbol) =>
    {
        const metadata = Metadata.from((target as TestObject)[key as string]!);

        metadata.category = name;
    };
}

export function shouldPass(target: object, propertyKey: string | symbol): void
{
    category("should pass")(target, propertyKey, Object.getOwnPropertyDescriptor(target, propertyKey) as TypedPropertyDescriptor<object>);
}

export function shouldFail(target: object, propertyKey: string | symbol): void
{
    category("should fail")(target, propertyKey, Object.getOwnPropertyDescriptor(target, propertyKey) as TypedPropertyDescriptor<object>);
}

export function skip<T extends Function>(target: T): T;
export function skip<T>(target: object, key: string | symbol, descriptor: TypedPropertyDescriptor<T>): void;
export function skip(...args: [Function] | [object, string | symbol, TypedPropertyDescriptor<unknown>]): void | Function
{
    if (args.length == 1)
    {
        if (Metadata.from(args[0]).suite)
        {
            throw new Error("@skip @suite order is invalid. Use @suite @skip instead.");
        }

        for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(args[0].prototype)))
        {
            if (key != "constructor" && typeof descriptor.value == "function")
            {
                Metadata.from(descriptor.value).skip = true;
            }
        }

        return args[0];
    }

    const [target, key] = args as [TestObject, string, unknown];

    Metadata.from(target[key]!).skip = true;
}

export function suite<T extends Function>(target: T): T;
export function suite(description: string): ClassDecorator;
export function suite(targetOrDescription: Function | string): ClassDecorator | Function
{
    const decorator = (target: Function, description: string): Function =>
    {
        Metadata.from(target).suite = true;

        const tests:       Test[]          = [];
        const categories: Indexer<Test[]> = { };

        let afterCallback:      Function | null = null;
        let afterEachCallback:  Function | null = null;
        let beforeCallback:     Function | null = null;
        let beforeEachCallback: Function | null = null;

        for (const name of Object.getOwnPropertyNames(target.prototype))
        {
            const method   = target.prototype[name] as Function;
            const metadata = Metadata.from(method);

            if (!metadata.skip)
            {
                if (metadata.after)
                {
                    afterCallback = method as Delegate;
                }

                if (metadata.afterEach)
                {
                    afterEachCallback = method as Delegate;
                }

                if (metadata.before)
                {
                    beforeCallback = method as Delegate;
                }

                if (metadata.beforeEach)
                {
                    beforeEachCallback = method as Delegate;
                }
            }

            if (metadata.test)
            {
                const categoryName = metadata.category;
                const getMethod    = metadata.skip ? () => noop : (context: object) => method.bind(context);
                const expectation = (metadata.skip ? "(Skipped) " : "") + metadata.expectation;

                if (categoryName)
                {
                    const category = categories[categoryName] = categories[categoryName] ?? [];

                    category.push({ expectation, getMethod });
                }
                else
                {
                    tests.push({ expectation, getMethod });
                }
            }

            if (metadata.batch)
            {
                const batch = metadata.batch;

                let index = 1;

                for (const data of batch.source)
                {
                    const skip         = metadata.skip || batch.skip(data, index);
                    const categoryName = metadata.category;
                    const getMethod    = skip ? () => noop : (context: object) => () => method.call(context, data);
                    const expectation  = (skip ? "(Skipped) " : "") + batch.expectation(data, index);

                    if (categoryName)
                    {
                        const category = categories[categoryName] = categories[categoryName] ?? [];
                        category.push({ expectation, getMethod, timeout: metadata.timeout });
                    }
                    else
                    {
                        tests.push({ expectation, getMethod, timeout: metadata.timeout });
                    }

                    index++;
                }
            }
        }

        mocha.suite
        (
            description,
            () =>
            {
                const context = new (target as Constructor)();

                if (beforeCallback)
                {
                    mocha.before(Metadata.from(beforeCallback).description, beforeCallback.bind(context));
                }

                if (beforeEachCallback)
                {
                    mocha.beforeEach(Metadata.from(beforeEachCallback).description, beforeEachCallback.bind(context));
                }

                for (const test of tests)
                {
                    mocha.test(test.expectation, test.getMethod(context));
                }

                for (const [name, tests] of Object.entries(categories) as [string, Test[]][])
                {
                    mocha.suite
                    (
                        name,
                        () =>
                        {
                            for (const test of tests)
                            {
                                const runnable = mocha.test(test.expectation, test.getMethod(context));

                                if (test.timeout)
                                {
                                    runnable.timeout(test.timeout);
                                }
                            }
                        },
                    );
                }

                if (afterEachCallback)
                {
                    mocha.afterEach(Metadata.from(afterEachCallback).description, afterEachCallback.bind(context));
                }

                if (afterCallback)
                {
                    mocha.after(Metadata.from(afterCallback).description, afterCallback.bind(context));
                }
            },
        );

        return target;
    };

    if (typeof targetOrDescription == "string")
    {
        return (target: Function) => decorator(target, targetOrDescription);
    }

    return decorator(targetOrDescription, camelToText(targetOrDescription.name));
}

export function test(target: object, key: string | symbol): void;
export function test(expectation: string): MethodDecorator;
export function test(...args: [string] | [object, string | symbol]): MethodDecorator | void
{
    const decorator = (target: TestObject, key: string, expectation: string): void =>
    {
        const metadata = Metadata.from(target[key]!);

        metadata.test        = true;
        metadata.expectation = expectation;
    };

    if (args.length == 1)
    {
        return (target: object, key: string | symbol) => decorator(target as TestObject, key.toString(), args[0]);
    }

    const [target, key] = args;

    decorator(target as TestObject, key.toString(), camelToText(key.toString()));
}

export function timeout(milliseconds: number): MethodDecorator
{
    return (target, key): void =>
    {
        const metadata = Metadata.from(target[key as keyof object]!);

        metadata.timeout = milliseconds;
    };
}

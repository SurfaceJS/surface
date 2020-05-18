import
{
    camelToText,
    Action,
    Constructor,
    Func1,
    Indexer,
    Nullable
} from "@surface/core";
import mocha from "./internal/mocha";
import
{
    AFTER,
    AFTER_EACH,
    BATCH,
    BEFORE,
    BEFORE_EACH,
    CATEGORY,
    DATA,
    DESCRIPTION,
    EXPECTATION,
    TEST
}
from "./internal/symbols";

export type TestMethod<T = unknown> = Function &
{
    [AFTER]?:       boolean;
    [AFTER_EACH]?:  boolean;
    [BEFORE]?:      boolean;
    [BEFORE_EACH]?: boolean;
    [BATCH]?:       boolean;
    [CATEGORY]?:    string;
    [DATA]?:        { source: Array<T>, expectation: Func1<T, string> };
    [DESCRIPTION]?: string;
    [EXPECTATION]?: string;
    [TEST]?:        boolean;
};

export type TestObject<T = unknown> = { [key: string]: TestMethod<T> };

type Test = { expectation: string, getMethod: (context: object) => () => void };

export function after(description: string): MethodDecorator;
export function after(target: object, key: string|symbol): void;
export function after(...args: [string]|[object, string|symbol]): MethodDecorator|void
{
    const decorator = (target: TestObject, key: string|symbol, description: string) =>
    {
        target[key as string][AFTER]       = true;
        target[key as string][DESCRIPTION] = description;
    };

    if (args.length == 1)
    {
        return (target: object, key: string|symbol) => decorator(target as TestObject, key, args[0]);
    }
    else
    {
        const [target, key] = args;
        decorator(target as TestObject, key, camelToText(key.toString()));
    }
}

export function afterEach(description: string): MethodDecorator;
export function afterEach(target: object, key: string|symbol): void;
export function afterEach(...args: [string]|[object, string|symbol]): MethodDecorator|void
{
    const decorator = (target: TestObject, key: string|symbol, description: string) =>
    {
        target[key as keyof TestObject][AFTER_EACH]  = true;
        target[key as keyof TestObject][DESCRIPTION] = description;
    };

    if (args.length == 1)
    {
        return (target: object, key: string|symbol) => decorator(target as TestObject, key, args[0]);
    }
    else
    {
        const [target, key] = args;
        decorator(target as TestObject, key, camelToText(key.toString()));
    }
}

export function batchTest<T = unknown>(source: Array<T>, expectation: Func1<T, string>): MethodDecorator
{
    return (target: object, key: string|symbol) =>
    {
        (target as TestObject<T>)[key as keyof TestObject<T>][BATCH] = true;
        (target as TestObject<T>)[key as keyof TestObject<T>][DATA]  = { source: source, expectation: expectation };
    };
}

export function before(description: string): MethodDecorator;
export function before(target: object, key: string|symbol): void;
export function before(...args: [string]|[object, string|symbol]): MethodDecorator|void
{
    const decorator = (target: TestObject, key: string|symbol, description: string) =>
    {
        target[key as string][BEFORE]      = true;
        target[key as string][DESCRIPTION] = description;
    };

    if (args.length == 1)
    {
        return (target: object, key: string|symbol) => decorator(target as TestObject, key, args[0]);
    }
    else
    {
        const [target, key] = args;
        decorator(target as TestObject, key, camelToText(key.toString()));
    }
}

export function beforeEach(description: string): MethodDecorator;
export function beforeEach(target: object, propertyKey: string|symbol): void;
export function beforeEach(...args: [string]|[object, string|symbol]): MethodDecorator|void
{
    const decorator = (target: TestObject, key: string|symbol, description: string) =>
    {
        target[key as keyof TestObject][BEFORE_EACH] = true;
        target[key as keyof TestObject][DESCRIPTION] = description;
    };

    if (args.length == 1)
    {
        return (target: object, key: string|symbol) => decorator(target as TestObject, key.toString(), args[0]);
    }
    else
    {
        const [target, key] = args;
        decorator(target as TestObject, key, camelToText(key.toString()));
    }
}

export function category(name: string): MethodDecorator
{
    return (target: object, key: string|symbol) =>
    {
        (target as TestObject)[key as string][CATEGORY] = name;
    };
}

export function shouldPass(target: object, propertyKey: string|symbol): void
{
    category("should pass")(target, propertyKey, Object.getOwnPropertyDescriptor(target, propertyKey) as TypedPropertyDescriptor<object>);
}

export function shouldFail(target: object, propertyKey: string|symbol): void
{
    category("should fail")(target, propertyKey, Object.getOwnPropertyDescriptor(target, propertyKey) as TypedPropertyDescriptor<object>);
}

export function suite(target: Function): void;
export function suite(description: string): ClassDecorator;
export function suite(targetOrDescription: Function|string): ClassDecorator|void
{
    const decorator = (target: Function, description: string) =>
    {
        const tests:       Array<Test>          = [];
        const catergories: Indexer<Array<Test>> = { };

        let afterCallback:      Nullable<TestMethod> = null;
        let afterEachCallback:  Nullable<TestMethod> = null;
        let beforeCallback:     Nullable<TestMethod> = null;
        let beforeEachCallback: Nullable<TestMethod> = null;

        for (const name of Object.getOwnPropertyNames(target.prototype))
        {
            const method = target.prototype[name] as TestMethod;
            if (method[AFTER])
            {
                afterCallback = method as Action;
            }

            if (method[AFTER_EACH])
            {
                afterEachCallback = method as Action;
            }

            if (method[BEFORE])
            {
                beforeCallback = method as Action;
            }

            if (method[BEFORE_EACH])
            {
                beforeEachCallback = method as Action;
            }

            if (method[TEST])
            {
                const categoryName = method[CATEGORY];
                if (categoryName)
                {
                    const category = catergories[categoryName] = catergories[categoryName] || [];
                    category.push
                    ({
                        getMethod:   (context: object) => method.bind(context),
                        expectation: method[EXPECTATION] || "",
                    });
                }
                else
                {
                    tests.push
                    ({
                        getMethod:   context => method.bind(context),
                        expectation: method[EXPECTATION] || "",
                    });
                }
            }

            if (method[BATCH])
            {
                const batch = method[DATA] as { source: Array<object>, expectation: Func1<object, string> };
                for (const data of batch.source)
                {
                    const categoryName = method[CATEGORY];
                    if (categoryName)
                    {
                        const category = catergories[categoryName] = catergories[categoryName] || [];
                        category.push
                        ({
                            expectation: batch.expectation(data),
                            getMethod:   (context: object) => () => method.call(context, data),
                        });
                    }
                    else
                    {
                        tests.push
                        ({
                            expectation: batch.expectation(data),
                            getMethod:   context => () => method.call(context, data),
                        });
                    }
                }
            }
        }

        mocha.suite
        (
            description,
            () =>
            {
                const context = new (target as Constructor<object>)();

                if (beforeCallback)
                {
                    mocha.before(beforeCallback[DESCRIPTION] || "", beforeCallback.bind(context));
                }

                if (beforeEachCallback)
                {
                    mocha.beforeEach(beforeEachCallback[DESCRIPTION] || "", beforeEachCallback.bind(context));
                }

                for (const test of tests)
                {
                    mocha.test(test.expectation, test.getMethod(context));
                }

                for (const [name, tests] of Object.entries(catergories) as Array<[string, Array<Test>]>)
                {
                    mocha.suite
                    (
                        name,
                        () =>
                        {
                            for (const test of tests)
                            {
                                mocha.test(test.expectation, test.getMethod(context));
                            }
                        }
                    );
                }

                if (afterEachCallback)
                {
                    mocha.afterEach(afterEachCallback[DESCRIPTION] || "", afterEachCallback.bind(context));
                }

                if (afterCallback)
                {
                    mocha.after(afterCallback[DESCRIPTION] || "", afterCallback.bind(context));
                }
            }
        );
    };

    if (typeof targetOrDescription == "string")
    {
        return (target: Function) => decorator(target, targetOrDescription);
    }
    else
    {
        decorator(targetOrDescription, camelToText(targetOrDescription.name));
    }
}

export function test(target: object, key: string|symbol): void;
export function test(expectation: string): MethodDecorator;
export function test(...args: [string]|[object, string|symbol]): MethodDecorator|void
{
    const decorator = (target: TestObject, key: string, expectation: string) =>
    {
        target[key][TEST]        = true;
        target[key][EXPECTATION] = expectation;
    };

    if (args.length == 1)
    {
        return (target: object, key: string|symbol) => decorator(target as TestObject, key.toString(), args[0]);
    }
    else
    {
        const [target, key] = args;
        decorator(target as TestObject, key.toString(), camelToText(key.toString()));
    }
}
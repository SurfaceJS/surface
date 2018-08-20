import { Action, Constructor, Func1, Nullable, ObjectLiteral } from "@surface/core";
import { camelToText }                                         from "@surface/core/common/string";
import mocha                                                   from "./internal/mocha";

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

export type TestMethod = Function &
{
    [AFTER]?:       boolean;
    [AFTER_EACH]?:   boolean;
    [BEFORE]?:      boolean;
    [BEFORE_EACH]?:  boolean;
    [BATCH]?:   boolean;
    [CATEGORY]?:    string;
    [DATA]?:        { source: Array<Object>, expectation: Func1<Object, string> };
    [DESCRIPTION]?: string;
    [EXPECTATION]?: string;
    [TEST]?:        boolean;
};

export type TestObject = { [key: string]: TestMethod };

type Test = { expectation: string, getMethod: (context: Object) => () => void };

export function after(description: string): MethodDecorator;
export function after(target: object, key: string|symbol): void;
export function after(...args: Array<Object>): MethodDecorator|void
{
    const decorator = (target: TestObject, key: string|symbol, description: string) =>
    {
        target[key as string][AFTER]       = true;
        target[key as string][DESCRIPTION] = description;
    };

    if (args.length == 1)
    {
        return (target: object, key: string|symbol) => decorator(target as TestObject, key, args[0] as string);
    }
    else
    {
        const [target, key] = args as [object, string];
        decorator(target as TestObject, key, camelToText(key));
    }
}

export function afterEach(description: string): MethodDecorator;
export function afterEach(target: object, key: string|symbol): void;
export function afterEach(...args: Array<Object>): MethodDecorator|void
{
    const decorator = (target: TestObject, key: string|symbol, description: string) =>
    {
        target[key as string][AFTER_EACH]   = true;
        target[key as string][DESCRIPTION] = description;
    };

    if (args.length == 1)
    {
        return (target: object, key: string|symbol) => decorator(target as TestObject, key, args[0] as string);
    }
    else
    {
        const [target, key] = args as [object, string];
        decorator(target as TestObject, key, camelToText(key));
    }
}

export function batchTest<T extends Object>(source: Array<T>, expectation: Func1<T, string>): MethodDecorator
{
    return (target: object, key: string|symbol) =>
    {
        (target as TestObject)[key as string][BATCH] = true;
        (target as TestObject)[key as string][DATA]      = { source: source as Array<Object>, expectation: expectation as Func1<Object, string> };
    };
}

export function before(description: string): MethodDecorator;
export function before<T>(target: object, key: string|symbol): void;
export function before(...args: Array<Object>): MethodDecorator|void
{
    const decorator = (target: TestObject, key: string|symbol, description: string) =>
    {
        target[key as string][BEFORE]      = true;
        target[key as string][DESCRIPTION] = description;
    };

    if (args.length == 1)
    {
        return (target: Object, key: string|symbol) => decorator(target as TestObject, key, args[0] as string);
    }
    else
    {
        const [target, key] = args as [object, string];
        decorator(target as TestObject, key, camelToText(key));
    }
}

export function beforeEach(description: string): MethodDecorator;
export function beforeEach<T>(target: object, propertyKey: string|symbol): void;
export function beforeEach(...args: Array<Object>): MethodDecorator|void
{
    const decorator = (target: TestObject, key: string, description: string) =>
    {
        target[key as string][BEFORE_EACH]  = true;
        target[key as string][DESCRIPTION] = description;
    };

    if (args.length == 1)
    {
        return (target: Object, key: string|symbol) => decorator(target as TestObject, key.toString(), args[0] as string);
    }
    else
    {
        const [target, key] = args as [object, string];
        decorator(target as TestObject, key, camelToText(key));
    }
}

export function category(name: string): MethodDecorator
{
    return (target: Object, key: string|symbol) =>
    {
        (target as TestObject)[key as string][CATEGORY] = name;
    };
}

export function shouldPass(target: object, propertyKey: string|symbol): void
{
    category("should pass")(target, propertyKey, Object.getOwnPropertyDescriptor(target, propertyKey) as TypedPropertyDescriptor<Object>);
}

export function shouldFail(target: object, propertyKey: string|symbol): void
{
    category("should fail")(target, propertyKey, Object.getOwnPropertyDescriptor(target, propertyKey) as TypedPropertyDescriptor<Object>);
}

export function suite(target: Function): void;
export function suite(description: string): ClassDecorator;
export function suite(targetOrDescription: Function|string): ClassDecorator|void
{
    const decorator = (target: Function, description: string) =>
    {
        const tests:       Array<Test>                = [];
        const catergories: ObjectLiteral<Array<Test>> = { };

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
                    catergories[categoryName] = catergories[categoryName] || [];
                    catergories[categoryName].push
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
                const batch = method[DATA] as { source: Array<Object>, expectation: Func1<Object, string> };
                for (const data of batch.source)
                {
                    const categoryName = method[CATEGORY];
                    if (categoryName)
                    {
                        catergories[categoryName] = catergories[categoryName] || [];
                        catergories[categoryName].push
                        ({
                            expectation: batch.expectation(data),
                            getMethod:   (context: Object) => () => method.call(context, data),
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
                const context = new (target as Constructor<Object>)();

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
export function test(...args: Array<Object>): MethodDecorator|void
{
    const decorator = (target: TestObject, key: string|symbol, expectation: string) =>
    {
        target[key as string][TEST]        = true;
        target[key as string][EXPECTATION] = expectation;
    };

    if (args.length == 1)
    {
        return (target: object, key: string|symbol) => decorator(target as TestObject, key, args[0] as string);
    }
    else
    {
        const [target, key] = args as [object, string];
        decorator(target as TestObject, key, camelToText(key));
    }
}
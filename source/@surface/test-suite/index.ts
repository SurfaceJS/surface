import { Action, Constructor, Func1, Nullable, ObjectLiteral } from "@surface/types";
import mocha                                                   from "./internal/mocha";

import
{
    afterEachToken,
    afterToken,
    batchTestToken,
    beforeEachToken,
    beforeToken,
    categoryToken,
    dataToken,
    descriptionToken,
    expectationToken,
    testToken
}
from "./internal/symbols";

type Test = { expectation: string, getMethod: (context: Object) => () => void };

function textify(identifier: string): string
{
    return identifier.split(/(?=[A-Z])/).join(" ").toLowerCase();
}

export function after(description: string): MethodDecorator;
export function after<T>(target: Object, key: string|symbol): void;
export function after(...args: Array<Object>): MethodDecorator|void
{
    const decorator = (target: Object, key: string|symbol, description: string) =>
    {
        target[key][afterToken]       = true;
        target[key][descriptionToken] = description;
    };

    if (args.length == 1)
    {
        return (target: Object, key: string|symbol) => decorator(target, key, args[0] as string);
    }
    else
    {
        const [target, key] = args as [Object, string];
        decorator(target, key, textify(key));
    }
}

export function afterEach(description: string): MethodDecorator;
export function afterEach<T>(target: Object, key: string|symbol): void;
export function afterEach(...args: Array<Object>): MethodDecorator|void
{
    const decorator = (target: Object, key: string|symbol, description: string) =>
    {
        target[key][afterEachToken]   = true;
        target[key][descriptionToken] = description;
    };

    if (args.length == 1)
    {
        return (target: Object, key: string|symbol) => decorator(target, key, args[0] as string);
    }
    else
    {
        const [target, key] = args as [Object, string];
        decorator(target, key, textify(key));
    }
}

export function batchTest<T>(source: Array<T>, expectation: Func1<T, string>): MethodDecorator
{
    return (target: Object, key: string|symbol) =>
    {
        target[key][batchTestToken] = true;
        target[key][dataToken]      = { source, expectation };
    };
}

export function before(description: string): MethodDecorator;
export function before<T>(target: Object, key: string|symbol): void;
export function before(...args: Array<Object>): MethodDecorator|void
{
    const decorator = (target: Object, key: string|symbol, description: string) =>
    {
        target[key][beforeToken]      = true;
        target[key][descriptionToken] = description;
    };

    if (args.length == 1)
    {
        return (target: Object, key: string|symbol) => decorator(target, key, args[0] as string);
    }
    else
    {
        const [target, key] = args as [Object, string];
        decorator(target, key, textify(key));
    }
}

export function beforeEach(description: string): MethodDecorator;
export function beforeEach<T>(target: Object, propertyKey: string|symbol): void;
export function beforeEach(...args: Array<Object>): MethodDecorator|void
{
    const decorator = (target: Object, key: string, description: string) =>
    {
        target[key][beforeEachToken]  = true;
        target[key][descriptionToken] = description;
    };

    if (args.length == 1)
    {
        return (target: Object, key: string|symbol) => decorator(target, key.toString(), args[0] as string);
    }
    else
    {
        const [target, key] = args as [Object, string];
        decorator(target, key, textify(key));
    }
}

export function category(name: string): MethodDecorator
{
    return (target: Object, key: string|symbol) =>
    {
        target[key][categoryToken] = name;
    };
}

export function shouldPass(target: Object, propertyKey: string|symbol): void
{
    category("should pass")(target, propertyKey, Object.getOwnPropertyDescriptor(target, propertyKey) as TypedPropertyDescriptor<Object>);
}

export function shouldFail(target: Object, propertyKey: string|symbol): void
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

        let afterCallback:      Nullable<Action> = null;
        let afterEachCallback:  Nullable<Action> = null;
        let beforeCallback:     Nullable<Action> = null;
        let beforeEachCallback: Nullable<Action> = null;

        for (const name of Object.getOwnPropertyNames(target.prototype))
        {
            const method = target.prototype[name] as Function;
            if (method[afterToken])
            {
                afterCallback = method as Action;
            }

            if (method[afterEachToken])
            {
                afterEachCallback = method as Action;
            }

            if (method[beforeToken])
            {
                beforeCallback = method as Action;
            }

            if (method[beforeEachToken])
            {
                beforeEachCallback = method as Action;
            }

            if (method[testToken])
            {
                const categoryName = method[categoryToken];
                if (categoryName)
                {
                    catergories[categoryName] = catergories[categoryName] || [];
                    catergories[categoryName].push
                    ({
                        getMethod:   context => method.bind(context),
                        expectation: method[expectationToken],
                    });
                }
                else
                {
                    tests.push
                    ({
                        getMethod:   context => method.bind(context),
                        expectation: method[expectationToken],
                    });
                }
            }

            if (method[batchTestToken])
            {
                const batch = method[dataToken] as { source: Array<Object>, expectation: Func1<Object, string> };
                for (const data of batch.source)
                {
                    const categoryName = method[categoryToken];
                    if (categoryName)
                    {
                        catergories[categoryName] = catergories[categoryName] || [];
                        catergories[categoryName].push
                        ({
                            expectation: batch.expectation(data),
                            getMethod:   context => () => method.call(context, data),
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
                if (beforeCallback)
                {
                    mocha.before(beforeCallback[descriptionToken], beforeCallback);
                }

                if (beforeEachCallback)
                {
                    mocha.beforeEach(beforeEachCallback[descriptionToken], beforeEachCallback);
                }

                for (const test of tests)
                {
                    const context = new (target as Constructor<Object>)();
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
                                const context = new (target as Constructor<Object>)();
                                mocha.test(test.expectation, test.getMethod(context));
                            }
                        }
                    );
                }

                if (afterEachCallback)
                {
                    mocha.afterEach(afterEachCallback[descriptionToken], afterEachCallback);
                }

                if (afterCallback)
                {
                    mocha.after(afterCallback[descriptionToken], afterCallback);
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
        decorator(targetOrDescription, textify(targetOrDescription.name));
    }
}

export function test(target: Object, key: string|symbol): void;
export function test(expectation: string): MethodDecorator;
export function test(...args: Array<Object>): MethodDecorator|void
{
    let expectation = "";

    const decorator = (target: Object, key: string|symbol) =>
    {
        target[key][testToken]        = true;
        target[key][expectationToken] = expectation;
    };

    if (args.length == 1)
    {
        expectation = args[0] as string;
        return decorator;
    }
    else
    {
        const [target, key] = args as [Object, string];
        expectation = key.split(/(?=[A-Z])/).join(" ").toLowerCase();
        decorator(target, key);
    }
}
import { Action, Constructor, Func1, Nullable, ObjectLiteral } from "@surface/types";
import mocha                                                   from "./internal/mocha";

const afterToken       = Symbol("test:after");
const afterEachToken   = Symbol("test:after-each");
const batchTestToken   = Symbol("test:batch");
const beforeToken      = Symbol("test:before");
const beforeEachToken  = Symbol("test:before-each");
const categoryToken    = Symbol("test:category");
const dataToken        = Symbol("test:data");
const descriptionToken = Symbol("test:description");
const expectationToken = Symbol("test:expectation");
const testToken        = Symbol("test:method");

type Test = { expectation: string, getMethod: (context: Object) => (done?: MochaDone) => void };

export function after(description?: string): MethodDecorator
{
    return (target: Object, key: string|symbol) =>
    {
        target[key][afterToken]       = true;
        target[key][descriptionToken] = description;
    };
}

export function afterEach(description?: string): MethodDecorator
{
    return (target: Object, key: string|symbol) =>
    {
        target[key][afterEachToken]   = true;
        target[key][descriptionToken] = description;
    };
}

export function batchTest<T>(source: Array<T>, expectation: Func1<T, string>): MethodDecorator
{
    return (target: Object, key: string|symbol) =>
    {
        target[key][batchTestToken] = true;
        target[key][dataToken]      = { source, expectation };
    };
}

export function before(description?: string): MethodDecorator
{
    return (target: Object, key: string|symbol) =>
    {
        target[key][beforeToken]      = true;
        target[key][descriptionToken] = description;
    };
}

export function beforeEach(description?: string): MethodDecorator
{
    return (target: Object, key: string|symbol) =>
    {
        target[key][beforeEachToken]      = true;
        target[key][descriptionToken] = description;
    };
}

export function category(name: string): MethodDecorator
{
    return (target: Object, key: string|symbol) =>
    {
        target[key][categoryToken] = name;
    };
}

export function suite(description: string): ClassDecorator
{
    return (target: Function) =>
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
                    mocha.before(beforeCallback);
                }

                if (beforeEachCallback)
                {
                    mocha.beforeEach(beforeEachCallback);
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
                    mocha.afterEach(afterEachCallback);
                }

                if (afterCallback)
                {
                    mocha.after(afterCallback);
                }
            }
        );
    };
}

export function test(expectation: string): MethodDecorator
{
    return (target: Object, key: string|symbol) =>
    {
        target[key][testToken]        = true;
        target[key][expectationToken] = expectation;
    };
}
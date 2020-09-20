import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import { It }                      from "..";
import Mock                        from "../internal/mock";
import someFactory                 from "./fixtures/consumer";

async function main(): Promise<unknown>
{
    const expected = { default: { value: 1000 }, someValue: 5 as 2 };

    Mock.module(await import("./fixtures/dependency"), expected);

    @suite
    class MockSpec
    {
        @test @shouldPass
        public mockConstructor(): void
        {
            class Foo
            {
                public constructor(public a: number, public b: number) { }

                public static getInstance(): Foo
                {
                    return new Foo(1, 2);
                }
            }

            const mock = Mock.newable<typeof Foo>();

            mock
                .new(It.any(), It.any())
                .returns(Mock.intance<Foo>().proxy);

            mock
                .setup("getInstance")
                .call()
                .returns(Mock.intance<Foo>().proxy);

            assert.isOk(new mock.proxy(1, 2));
            assert.isOk(mock.proxy.getInstance());
        }

        @test @shouldPass
        public mockModule(): void
        {
            const actual = someFactory();

            assert.equal(actual.object, expected.default);
            assert.equal(actual.value, expected.someValue);
        }
    }

    return MockSpec;
}

export default main();
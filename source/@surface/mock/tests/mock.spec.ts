import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
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
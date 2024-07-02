/* eslint-disable import/extensions */
import { assert } from "chai";
import
{
    after,
    afterEach,
    batchTest,
    before,
    beforeEach,
    category,
    shouldFail,
    shouldPass,
    skip,
    suite,
    test,
} from "../internal/decorators.js";
import Metadata from "../internal/metadata.js";

@suite
export default class DecoratorsSpec
{
    @before
    public before(): void
    {
        // Coverage
    }

    @beforeEach
    public beforeEach(): void
    {
        // Coverage
    }

    @after
    public after(): void
    {
        // Coverage
    }

    @afterEach
    public afterEach(): void
    {
        // Coverage
    }

    @test @shouldPass
    public decorateClassWithSuite(): void
    {
        class DecorateClassWithSuiteSpec
        { }

        assert.doesNotThrow(() => suite(DecorateClassWithSuiteSpec));
    }

    @test @shouldPass
    public decorateClassWithSuiteAndSkip(): void
    {
        @suite
        @skip
        class DecorateClassWithSuiteAndSkipSpec
        {
            @test
            public test1(): void
            {
                // Noop
            }

            @test
            public test2(): void
            {
                // Noop
            }
        }

        assert.isTrue(Metadata.from(DecorateClassWithSuiteAndSkipSpec.prototype.test1).skip);
        assert.isTrue(Metadata.from(DecorateClassWithSuiteAndSkipSpec.prototype.test2).skip);
    }

    @test @shouldPass
    public decorateClassWithSuiteAndDescription(): void
    {
        assert.doesNotThrow(() => suite("mock suite")(class Mock { }));
    }

    @test @shouldPass
    public decorateClassWithSuiteAndTest(): void
    {
        @suite
        class DecorateClassWithSuiteAndTestSpec
        {
            @test
            public test(): void
            {
                // Noop
            }

            @test("Test with custom description")
            public testWithDescription(): void
            {
                // Noop
            }

            @test @shouldPass
            public testShouldPass(): void
            {
                // Noop
            }

            @test @shouldFail
            public testShouldFail(): void
            {
                // Noop
            }

            @test @category("Some category")
            public testWithCategory(): void
            {
                // Noop
            }

            @test @skip
            public testWithSkip(): void
            {
                // Noop
            }
        }

        assert.isTrue(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.test).test);
        assert.equal(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.test).expectation, "test");
        assert.isTrue(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testWithDescription).test);
        assert.equal(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testWithDescription).expectation, "Test with custom description");
        assert.isTrue(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testShouldPass).test);
        assert.equal(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testShouldPass).expectation, "test should pass");
        assert.equal(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testShouldPass).category, "should pass");
        assert.isTrue(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testShouldFail).test);
        assert.equal(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testShouldFail).expectation, "test should fail");
        assert.equal(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testShouldFail).category, "should fail");
        assert.isTrue(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testWithCategory).test);
        assert.equal(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testWithCategory).expectation, "test with category");
        assert.equal(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testWithCategory).category, "Some category");
        assert.isTrue(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testWithSkip).test);
        assert.isTrue(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testWithSkip).skip);
    }

    @test @shouldPass
    public decorateClassWithSuiteAndTestWithBatch(): void
    {
        let current = 1;

        @suite
        class DecorateClassWithSuiteAndTestWithBatchSpec
        {
            @batchTest([1, 2, 3])
            public batchTest(value: number): void
            {
                assert.equal(value, current++);
            }

            @batchTest([1, 2, 3], (x: number) => `expected value is ${x}`)
            public batchTestWithMessage(): void
            {
                // Noop
            }

            @category("batch category") @batchTest([1, 2, 3], (x: number) => `expected value is ${x}`)
            public batchCategory(): void
            {
                // Noop
            }

            @skip @batchTest([1, 2, 3], (x: number) => `expected value is ${x}`)
            public batchSkip(): void
            {
                // Noop
            }

            @batchTest([1, 2, 3], (x: number) => `expected value is ${x}`, x => x == 2)
            public batchSkipCondition(): void
            {
                // Noop
            }
        }

        assert.isNotEmpty(Metadata.from(DecorateClassWithSuiteAndTestWithBatchSpec.prototype.batchTest).batch);
        assert.deepEqual(Metadata.from(DecorateClassWithSuiteAndTestWithBatchSpec.prototype.batchTest).batch!.source, [1, 2, 3]);
        assert.deepEqual(Metadata.from(DecorateClassWithSuiteAndTestWithBatchSpec.prototype.batchTestWithMessage).batch!.expectation.toString(), ((x: number) => `expected value is ${x}`).toString());
    }

    @test @shouldPass
    public decorateClassWithSuiteAndAfter(): void
    {
        @suite
        class DecorateClassWithSuiteAndAfterSpec
        {
            @after
            public afterTests(): void
            {
                // Noop
            }

            @after("after tests with custom description")
            public afterTestsWithDescription(): void
            {
                // Noop
            }
        }

        assert.equal(Metadata.from(DecorateClassWithSuiteAndAfterSpec.prototype.afterTests).after, true);
        assert.equal(Metadata.from(DecorateClassWithSuiteAndAfterSpec.prototype.afterTests).description, "after tests");
        assert.equal(Metadata.from(DecorateClassWithSuiteAndAfterSpec.prototype.afterTestsWithDescription).after, true);
        assert.equal(Metadata.from(DecorateClassWithSuiteAndAfterSpec.prototype.afterTestsWithDescription).description, "after tests with custom description");
    }

    @test @shouldPass
    public decorateClassWithSuiteAndAfterEach(): void
    {
        @suite
        class DecorateClassWithSuiteAndAfterEachSpec
        {
            @afterEach
            public afterEachTests(): void
            {
                // Noop
            }

            @afterEach("after each tests with custom description")
            public afterEachTestsWithDescription(): void
            {
                // Noop
            }
        }

        assert.equal(Metadata.from(DecorateClassWithSuiteAndAfterEachSpec.prototype.afterEachTests).afterEach, true);
        assert.equal(Metadata.from(DecorateClassWithSuiteAndAfterEachSpec.prototype.afterEachTests).description, "after each tests");
        assert.equal(Metadata.from(DecorateClassWithSuiteAndAfterEachSpec.prototype.afterEachTestsWithDescription).afterEach, true);
        assert.equal(Metadata.from(DecorateClassWithSuiteAndAfterEachSpec.prototype.afterEachTestsWithDescription).description, "after each tests with custom description");
    }

    @test @shouldPass
    public decorateClassWithSuiteAndBefore(): void
    {
        @suite
        class DecorateClassWithSuiteAndBeforeSpec
        {
            @before
            public beforeTests(): void
            {
                // Noop
            }

            @before("before tests with custom description")
            public beforeTestsWithDescription(): void
            {
                // Noop
            }
        }

        assert.equal(Metadata.from(DecorateClassWithSuiteAndBeforeSpec.prototype.beforeTests).before, true);
        assert.equal(Metadata.from(DecorateClassWithSuiteAndBeforeSpec.prototype.beforeTests).description, "before tests");
        assert.equal(Metadata.from(DecorateClassWithSuiteAndBeforeSpec.prototype.beforeTestsWithDescription).before, true);
        assert.equal(Metadata.from(DecorateClassWithSuiteAndBeforeSpec.prototype.beforeTestsWithDescription).description, "before tests with custom description");
    }

    @test @shouldPass
    public decorateBeforeEach(): void
    {
        @suite
        class DecorateClassWithSuiteAndBeforeEachAndDescriptionSpec
        {
            @beforeEach
            public beforeEach(): void
            {
                // Noop
            }

            @beforeEach("before each tests with custom description")
            public beforeEachWithDescription(): void
            {
                // Noop
            }
        }

        assert.equal(Metadata.from(DecorateClassWithSuiteAndBeforeEachAndDescriptionSpec.prototype.beforeEach).beforeEach, true);
        assert.equal(Metadata.from(DecorateClassWithSuiteAndBeforeEachAndDescriptionSpec.prototype.beforeEach).description, "before each");
        assert.equal(Metadata.from(DecorateClassWithSuiteAndBeforeEachAndDescriptionSpec.prototype.beforeEachWithDescription).beforeEach, true);
        assert.equal(Metadata.from(DecorateClassWithSuiteAndBeforeEachAndDescriptionSpec.prototype.beforeEachWithDescription).description, "before each tests with custom description");
    }

    @test
    public nonCategorizedTest(): void
    {
        // Coverage
    }

    @test @shouldFail
    public decorateClassWithSuiteTestAndInvalidSkip(): void
    {
        class DecorateClassWithSuiteTestAndInvalidSkipSpec
        { }

        assert.throw(() => skip(suite(DecorateClassWithSuiteTestAndInvalidSkipSpec)));
    }
}

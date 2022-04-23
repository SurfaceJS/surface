/* eslint-disable import/extensions */
import chai from "chai";
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

        chai.assert.doesNotThrow(() => suite(DecorateClassWithSuiteSpec));
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

        chai.assert.isTrue(Metadata.from(DecorateClassWithSuiteAndSkipSpec.prototype.test1).skip);
        chai.assert.isTrue(Metadata.from(DecorateClassWithSuiteAndSkipSpec.prototype.test2).skip);
    }

    @test @shouldPass
    public decorateClassWithSuiteAndDescription(): void
    {
        chai.assert.doesNotThrow(() => suite("mock suite")(class Mock { }));
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

        chai.assert.isTrue(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.test).test);
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.test).expectation, "test");
        chai.assert.isTrue(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testWithDescription).test);
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testWithDescription).expectation, "Test with custom description");
        chai.assert.isTrue(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testShouldPass).test);
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testShouldPass).expectation, "test should pass");
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testShouldPass).category, "should pass");
        chai.assert.isTrue(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testShouldFail).test);
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testShouldFail).expectation, "test should fail");
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testShouldFail).category, "should fail");
        chai.assert.isTrue(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testWithCategory).test);
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testWithCategory).expectation, "test with category");
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testWithCategory).category, "Some category");
        chai.assert.isTrue(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testWithSkip).test);
        chai.assert.isTrue(Metadata.from(DecorateClassWithSuiteAndTestSpec.prototype.testWithSkip).skip);
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
                chai.assert.equal(value, current++);
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

        chai.assert.isNotEmpty(Metadata.from(DecorateClassWithSuiteAndTestWithBatchSpec.prototype.batchTest).batch);
        chai.assert.deepEqual(Metadata.from(DecorateClassWithSuiteAndTestWithBatchSpec.prototype.batchTest).batch!.source, [1, 2, 3]);
        chai.assert.deepEqual(Metadata.from(DecorateClassWithSuiteAndTestWithBatchSpec.prototype.batchTestWithMessage).batch!.expectation.toString(), ((x: number) => `expected value is ${x}`).toString());
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

        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndAfterSpec.prototype.afterTests).after, true);
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndAfterSpec.prototype.afterTests).description, "after tests");
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndAfterSpec.prototype.afterTestsWithDescription).after, true);
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndAfterSpec.prototype.afterTestsWithDescription).description, "after tests with custom description");
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

        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndAfterEachSpec.prototype.afterEachTests).afterEach, true);
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndAfterEachSpec.prototype.afterEachTests).description, "after each tests");
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndAfterEachSpec.prototype.afterEachTestsWithDescription).afterEach, true);
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndAfterEachSpec.prototype.afterEachTestsWithDescription).description, "after each tests with custom description");
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

        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndBeforeSpec.prototype.beforeTests).before, true);
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndBeforeSpec.prototype.beforeTests).description, "before tests");
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndBeforeSpec.prototype.beforeTestsWithDescription).before, true);
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndBeforeSpec.prototype.beforeTestsWithDescription).description, "before tests with custom description");
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

        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndBeforeEachAndDescriptionSpec.prototype.beforeEach).beforeEach, true);
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndBeforeEachAndDescriptionSpec.prototype.beforeEach).description, "before each");
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndBeforeEachAndDescriptionSpec.prototype.beforeEachWithDescription).beforeEach, true);
        chai.assert.equal(Metadata.from(DecorateClassWithSuiteAndBeforeEachAndDescriptionSpec.prototype.beforeEachWithDescription).description, "before each tests with custom description");
    }

    @test
    public uncategorizedTest(): void
    {
        // Coverage
    }

    @test @shouldFail
    public decorateClassWithSuiteTestAndInvalidSkip(): void
    {
        class DecorateClassWithSuiteTestAndInvalidSkipSpec
        { }

        chai.assert.throw(() => skip(suite(DecorateClassWithSuiteTestAndInvalidSkipSpec)));
    }
}
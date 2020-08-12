import { expect } from "chai";
import
{
    TestMethod,
    after,
    afterEach,
    batchTest,
    before,
    beforeEach,
    category,
    shouldFail,
    shouldPass,
    suite,
    test,
} from "../internal/decorators";
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
    TEST,
} from "../internal/symbols";

@suite
export default class TestSuitSpec
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
        class Mock
        { }

        expect(() => suite(Mock)).to.not.throw();
    }

    @test @shouldPass
    public decorateClassWithSuiteAndDescription(): void
    {
        expect(() => suite("mock suite")(class Mock { })).to.not.throw();
    }

    @test @shouldPass
    public decorateClassWithSuiteAndTest(): void
    {
        @suite
        class Mock
        {
            @test
            public test(): void
            {
                expect(true).to.equal(true);
            }
        }

        expect((Mock.prototype.test as TestMethod)[TEST]).to.equal(true);
        expect((Mock.prototype.test as TestMethod)[EXPECTATION]).to.equal("test");
    }

    @test @shouldPass
    public decorateClassWithSuiteAndTestWithExpectation(): void
    {
        @suite
        class Mock
        {
            @test("test should pass")
            public test(): void
            {
                expect(true).to.equal(true);
            }
        }

        expect((Mock.prototype.test as TestMethod)[TEST]).to.equal(true);
        expect((Mock.prototype.test as TestMethod)[EXPECTATION]).to.equal("test should pass");
    }

    @test @shouldPass
    public decorateClassWithSuiteAndTestWithCategory(): void
    {
        class Mock
        {
            @test @category("custom category")
            public testCategoryDecorator(): void
            {
                expect(true).to.equal(true);
            }
        }

        expect((Mock.prototype.testCategoryDecorator as TestMethod)[CATEGORY]).to.equal("custom category");
    }

    @test @shouldPass
    public decorateClassWithSuiteAndTestWithShouldPassCategory(): void
    {
        class Mock
        {
            @test @shouldPass
            public testCategoryDecorator(): void
            {
                expect(true).to.equal(true);
            }
        }

        expect((Mock.prototype.testCategoryDecorator as TestMethod)[CATEGORY]).to.equal("should pass");
    }

    @test @shouldPass
    public decorateClassWithSuiteAndTestWithShouldFailCategory(): void
    {
        class Mock
        {
            @test @shouldFail
            public testCategoryDecorator(): void
            {
                expect(true).to.equal(true);
            }
        }

        expect((Mock.prototype.testCategoryDecorator as TestMethod)[CATEGORY]).to.equal("should fail");
    }

    @test @shouldPass
    public decorateClassWithSuiteAndTestWithBatch(): void
    {
        let current = 1;

        @suite
        class Mock
        {
            @batchTest([1, 2, 3], (x: number) => `expected value is ${x}`)
            public batchTest(value: number): void
            {
                expect(value).to.equal(current++);
            }
        }

        expect((Mock.prototype.batchTest as TestMethod)[BATCH]).to.equal(true);
        expect((Mock.prototype.batchTest as TestMethod)[DATA]!.source).to.deep.equal([1, 2, 3]);
        expect((Mock.prototype.batchTest as TestMethod)[DATA]!.expectation.toString())
            .to.deep.equal(((x: number) => `expected value is ${x}`).toString());
    }

    @test @shouldPass
    public decorateClassWithSuiteAndAfter(): void
    {
        @suite
        class Mock
        {
            @after
            public afterTests(): void
            {
                // Coverage
            }
        }

        expect((Mock.prototype.afterTests as TestMethod)[AFTER]).to.equal(true);
        expect((Mock.prototype.afterTests as TestMethod)[DESCRIPTION]).to.equal("after tests");
    }

    @test @shouldPass
    public decorateClassWithSuiteAndAfterAndDescription(): void
    {
        @suite
        class Mock
        {
            @after("after tests with custom description")
            public afterTests(): void
            {
                // Coverage
            }
        }

        expect((Mock.prototype.afterTests as TestMethod)[AFTER]).to.equal(true);
        expect((Mock.prototype.afterTests as TestMethod)[DESCRIPTION]).to.equal("after tests with custom description");
    }

    @test @shouldPass
    public decorateClassWithSuiteAndAfterEach(): void
    {
        @suite
        class Mock
        {
            @afterEach
            public afterEachTests(): void
            {
                // Coverage
            }
        }

        expect((Mock.prototype.afterEachTests as TestMethod)[AFTER_EACH]).to.equal(true);
        expect((Mock.prototype.afterEachTests as TestMethod)[DESCRIPTION]).to.equal("after each tests");
    }

    @test @shouldPass
    public decorateClassWithSuiteAndBefore(): void
    {
        @suite
        class Mock
        {
            @before
            public beforeTests(): void
            {
                // Coverage
            }
        }

        expect((Mock.prototype.beforeTests as TestMethod)[BEFORE]).to.equal(true);
        expect((Mock.prototype.beforeTests as TestMethod)[DESCRIPTION]).to.equal("before tests");
    }

    @test @shouldPass
    public decorateClassWithSuiteAndBeforeWithDescription(): void
    {
        @suite
        class Mock
        {
            @before("before tests with custom description")
            public beforeTests(): void
            {
                // Coverage
            }
        }

        expect((Mock.prototype.beforeTests as TestMethod)[BEFORE]).to.equal(true);
        expect((Mock.prototype.beforeTests as TestMethod)[DESCRIPTION]).to.equal("before tests with custom description");
    }

    @test @shouldPass
    public decorateClassWithSuiteAndBeforeEachAndDescription(): void
    {
        @suite
        class Mock
        {
            @beforeEach("before each tests with custom description")
            public beforeEachTests(): void
            {
                // Coverage
            }
        }

        expect((Mock.prototype.beforeEachTests as TestMethod)[BEFORE_EACH]).to.equal(true);
        expect((Mock.prototype.beforeEachTests as TestMethod)[DESCRIPTION]).to.equal("before each tests with custom description");
    }

    @test @shouldPass
    public decorateClassWithSuiteAndAfterEachAndDescription(): void
    {
        @suite
        class Mock
        {
            @afterEach("after each tests with custom description")
            public afterEachTests(): void
            {
                // Coverage
            }
        }

        expect((Mock.prototype.afterEachTests as TestMethod)[AFTER_EACH]).to.equal(true);
        expect((Mock.prototype.afterEachTests as TestMethod)[DESCRIPTION]).to.equal("after each tests with custom description");
    }

    @test @shouldPass
    public decorateClassWithSuiteAndBeforeEach(): void
    {
        @suite
        class Mock
        {
            @beforeEach
            public beforeEachTests(): void
            {
                // Coverage
            }
        }

        expect((Mock.prototype.beforeEachTests as TestMethod)[BEFORE_EACH]).to.equal(true);
        expect((Mock.prototype.beforeEachTests as TestMethod)[DESCRIPTION]).to.equal("before each tests");
    }

    @test
    public uncategorizedTest(): void
    {
        // Coverage
    }
}
import { expect } from "chai";
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
    suite,
    test,
}
from "..";
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
from "../internal/symbols";

@suite
export default class TestSuitSpec
{
    @before
    public before(): void
    {
        return; // coverage
    }

    @beforeEach
    public beforeEach(): void
    {
        return; // coverage
    }

    @after
    public after(): void
    {
        return; // coverage
    }

    @afterEach
    public afterEach(): void
    {
        return; // coverage
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

        expect(Mock.prototype.test[testToken]).to.equal(true);
        expect(Mock.prototype.test[expectationToken]).to.equal("test");
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

        expect(Mock.prototype.test[testToken]).to.equal(true);
        expect(Mock.prototype.test[expectationToken]).to.equal("test should pass");
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

        expect(Mock.prototype.testCategoryDecorator[categoryToken]).to.equal("custom category");
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

        expect(Mock.prototype.testCategoryDecorator[categoryToken]).to.equal("should pass");
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

        expect(Mock.prototype.testCategoryDecorator[categoryToken]).to.equal("should fail");
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

        expect(Mock.prototype.batchTest[batchTestToken]).to.equal(true);
        expect(Mock.prototype.batchTest[dataToken]["source"]).to.deep.equal([1, 2, 3]);
        expect(Mock.prototype.batchTest[dataToken]["expectation"].toString())
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
                return;
            }
        }

        expect(Mock.prototype.afterTests[afterToken]).to.equal(true);
        expect(Mock.prototype.afterTests[descriptionToken]).to.equal("after tests");
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
                return;
            }
        }

        expect(Mock.prototype.afterTests[afterToken]).to.equal(true);
        expect(Mock.prototype.afterTests[descriptionToken]).to.equal("after tests with custom description");
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
                return;
            }
        }

        expect(Mock.prototype.afterEachTests[afterEachToken]).to.equal(true);
        expect(Mock.prototype.afterEachTests[descriptionToken]).to.equal("after each tests");
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
                return;
            }
        }

        expect(Mock.prototype.beforeTests[beforeToken]).to.equal(true);
        expect(Mock.prototype.beforeTests[descriptionToken]).to.equal("before tests");
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
                return;
            }
        }

        expect(Mock.prototype.beforeTests[beforeToken]).to.equal(true);
        expect(Mock.prototype.beforeTests[descriptionToken]).to.equal("before tests with custom description");
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
                return;
            }
        }

        expect(Mock.prototype.beforeEachTests[beforeEachToken]).to.equal(true);
        expect(Mock.prototype.beforeEachTests[descriptionToken]).to.equal("before each tests with custom description");
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
                return;
            }
        }

        expect(Mock.prototype.afterEachTests[afterEachToken]).to.equal(true);
        expect(Mock.prototype.afterEachTests[descriptionToken]).to.equal("after each tests with custom description");
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
                return;
            }
        }

        expect(Mock.prototype.beforeEachTests[beforeEachToken]).to.equal(true);
        expect(Mock.prototype.beforeEachTests[descriptionToken]).to.equal("before each tests");
    }

    @test
    public uncategorizedTest(): void
    {
        return; // coverage
    }
}
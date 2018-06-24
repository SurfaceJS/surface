import { before, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import * as chai                                       from "chai";
import DataProvider                                    from "../../data-table/internal/data-provider";

@suite
export default class DataProviderSpec
{
    private dataProvider!: DataProvider<number>;

    @before
    public before(): void
    {
        this.dataProvider = new DataProvider([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3);
    }

    @test @shouldPass
    public default(): void
    {
        chai.expect(this.dataProvider.pageCount, "page count").to.equal(4);
        chai.expect(Array.from(this.dataProvider), "iteration").to.deep.equal([1, 2, 3]);
    }

    @test @shouldPass
    public nextPage(): void
    {
        this.dataProvider.nextPage();

        chai.expect(Array.from(this.dataProvider)).to.deep.equal([4, 5, 6]);
    }

    @test @shouldPass
    public lastPage(): void
    {
        this.dataProvider.lastPage();

        chai.expect(Array.from(this.dataProvider)).to.deep.equal([10]);
    }

    @test @shouldPass
    public previousPage(): void
    {
        this.dataProvider.previousPage();

        chai.expect(Array.from(this.dataProvider)).to.deep.equal([7, 8, 9]);
    }

    @test @shouldPass
    public firstPage(): void
    {
        this.dataProvider.firstPage();

        chai.expect(Array.from(this.dataProvider)).to.deep.equal([1, 2, 3]);
    }

    @test @shouldPass
    public changePageSize(): void
    {
        this.dataProvider.pageSize = 5;

        this.dataProvider.page = 2;

        chai.expect(this.dataProvider.pageCount, "page size 5 - page count").to.equal(2);
        chai.expect(Array.from(this.dataProvider), "page size 2 - iteration").to.deep.equal([6, 7, 8, 9, 10]);

        this.dataProvider.pageSize = 4;

        this.dataProvider.page = 2;

        chai.expect(this.dataProvider.pageCount, "page size 4 - page count").to.equal(3);
        chai.expect(Array.from(this.dataProvider), "page size 2 - iteration").to.deep.equal([5, 6, 7, 8]);
    }

    @test @shouldPass
    public firstPageAndPreviousPage(): void
    {
        this.dataProvider.firstPage();
        this.dataProvider.previousPage();

        chai.expect(this.dataProvider.page).to.equal(1);
    }

    @test @shouldPass
    public lastPageAndNextPage(): void
    {
        this.dataProvider.lastPage();
        this.dataProvider.nextPage();

        chai.expect(this.dataProvider.page).to.equal(3);
    }

    @test @shouldFail
    public setPageLesserThanOne(): void
    {
        chai.expect(() => this.dataProvider.page = -1).to.throw(Error, "Value cannot be lesser than 1");
    }

    @test @shouldFail
    public setPageGreaterThanTotal(): void
    {
        chai.expect(() => this.dataProvider.page = 4).to.throw(Error, "Value exceed total of pages");
    }

    @test @shouldFail
    public setPageSizeLesserThanOne(): void
    {
        chai.expect(() => this.dataProvider.pageSize = -1).to.throw(Error, "Page size cannot be lesser than 1");
    }

    @test @shouldFail
    public setPageSizeGreaterThanTotal(): void
    {
        chai.expect(() => this.dataProvider.pageSize = 11).to.throw(Error, "Page size cannot be greater than total");
    }
}
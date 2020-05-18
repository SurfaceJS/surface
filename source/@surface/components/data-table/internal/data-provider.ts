import { Func1 }                           from "@surface/core";
import Enumerable                          from "@surface/enumerable";
import IDataProvider, { Criteria, Result } from "../interfaces/data-provider";

export default class DataProvider<T extends Object> implements IDataProvider<T>
{
    private readonly datasource: Array<T>;

    public constructor(source: Array<T>)
    {
        this.datasource = source;
    }

    public async create(data: T): Promise<void>
    {
        this.datasource.push(data);
    }

    public async delete(data: T): Promise<void>
    {
        this.datasource.splice(this.datasource.indexOf(data), 1);
    }

    public async read(criteria: Criteria): Promise<Result<T>>
    {
        let datasource = Enumerable.from(this.datasource);

        if (criteria.sorting.length > 0)
        {
            const predicate = criteria.sorting[0].field.includes(".") ?
                Function("x", "return x." + criteria.sorting[0].field) as Func1<T, T[keyof T]> :
                (element: T) => element[criteria.sorting[0].field as keyof T];

            datasource = criteria.sorting[0].direction == "asc" ?
                datasource.orderBy(predicate)
                : datasource.orderByDescending(predicate);
        }

        return await Promise.resolve({ data: datasource.skip(criteria.skip).take(criteria.take), filtered: datasource.count(), total: datasource.count() });
    }

    public async update(data: T): Promise<void>
    {
        return await Promise.resolve();
    }
}
import { Nullable } from "@surface/core";

export type Condition =
{
    type:     string,
    operator: string|null,
    value:    unknown
}

export type Criteria =
{
    filters: Array<Filter>,
    sorting: Array<Order>,
    skip:    number;
    take:    number;
}

export type Filter =
{
    conditions: Array<Condition>,
    field:      string,
    order:      Order,
    skip:       number;
    take:       number;
    type:       string,
};

export type Order =
{
    direction: "asc"|"desc",
    field:     string,
}

export type Result<T> =
{
    data:     Iterable<T>,
    filtered: number,
    total:    number,
}

export default interface IDataProvider<T extends object = object>
{
    create(data: T):          Promise<void>;
    delete(data: T):          Promise<void>;
    read(criteria: Criteria): Promise<Result<T>>;
    update(data: T):          Promise<void>;
}
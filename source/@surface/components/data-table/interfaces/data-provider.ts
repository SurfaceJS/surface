export type Order = { field: string, direction: "asc"|"desc" };

export default interface IDataProvider<T extends object = object>
{
    page:            number;
    pageCount:       number;
    pageSize:        number;
    total:           number;
    order:           Order;
    create(data: T): Promise<void>;
    delete(data: T): Promise<void>;
    read():          Promise<Iterable<T>>;
    update(data: T): Promise<void>;
}
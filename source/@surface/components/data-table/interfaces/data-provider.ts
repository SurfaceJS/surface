export default interface IDataProvider<T>
{
    page:                                          number;
    pageCount:                                     number;
    pageSize:                                      number;
    total:                                         number;
    create(data: T):                               Promise<void>;
    delete(data: T):                               Promise<void>;
    firstPage():                                   void;
    nextPage():                                    void;
    lastPage():                                    void;
    order(field: string, direction: "asc"|"desc"): void;
    read():                                        Promise<Iterable<T>>;
    previousPage():                                void;
    update(data: T):                               Promise<void>;
}
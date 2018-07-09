export default interface IDataProvider<T> extends Iterable<T>
{
    page:            number;
    pageCount:       number;
    pageSize:        number;
    total:           number;
    add(data: T):    void;
    delete(data: T): void;
    firstPage():     void;
    nextPage():      void;
    lastPage():      void;
    previousPage():  void;
}
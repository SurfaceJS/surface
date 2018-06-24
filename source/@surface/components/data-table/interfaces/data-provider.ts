export default interface IDataProvider<T> extends Iterable<T>
{
    page:    number;
    total:          number;
    firstPage():    void;
    nextPage():     void;
    lastPage():     void;
    previousPage(): void;
}
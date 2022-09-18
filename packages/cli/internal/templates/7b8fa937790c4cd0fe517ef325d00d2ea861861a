/* eslint-disable @typescript-eslint/ban-types */
import Store from "./store";

export default class Database
{
    public constructor(private readonly database: IDBDatabase)
    { }

    public objectStore<T extends object>(storeName: string, mode?: IDBTransactionMode): Store<T>
    {
        return new Store<T>(this.database.transaction([storeName], mode).objectStore(storeName));
    }
}
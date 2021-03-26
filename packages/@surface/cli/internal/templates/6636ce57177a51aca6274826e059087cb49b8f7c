/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-types
export default class Store<T extends object>
{
    public constructor(private readonly store: IDBObjectStore)
    { }

    private promesify<T, F extends (...args: any[]) => IDBRequest<T>>(fn: F, ...args: Parameters<F>): Promise<T>
    {
        return new Promise
        (
            (resolve, reject) =>
            {
                const request = fn.call(this.store, ...args);

                const onComplete = (): void =>
                {
                    removeEvents();

                    resolve(request.result);
                };

                const onError = (): void =>
                {
                    removeEvents();

                    reject(request.error);
                };

                const removeEvents = (): void =>
                {
                    request.transaction!.removeEventListener("complete", onComplete);
                    request.transaction!.removeEventListener("error", onError);
                    request.transaction!.removeEventListener("abort", onError);
                }

                request.transaction!.addEventListener("complete", onComplete)
                request.transaction!.addEventListener("error", onError);
                request.transaction!.addEventListener("abort", onError);
            }
        );
    }

    public async add(value: T, key?: IDBValidKey): Promise<IDBValidKey>
    {
        return this.promesify(this.store.add, value, key);
    }

    public async count(key?: IDBValidKey | IDBKeyRange): Promise<number>
    {
        return this.promesify(this.store.count, key);
    }

    public async clear(): Promise<undefined>
    {
        return this.promesify(this.store.clear);
    }

    public createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters): IDBIndex
    {
        return this.store.createIndex(name, keyPath, options);
    }

    public async delete(key: IDBValidKey | IDBKeyRange): Promise<undefined>
    {
        return this.promesify(this.store.delete, key);
    }

    public deleteIndex(name: string): void
    {
        this.store.deleteIndex(name);
    }

    public async get(key: IDBValidKey | IDBKeyRange): Promise<T | null>
    {
        return this.promesify(this.store.get, key);
    }

    public async getAll(): Promise<T[]>
    {
        return this.promesify(this.store.getAll);
    }

    public async getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<IDBValidKey[]>
    {
        return this.promesify(this.store.getAllKeys, query, count);
    }

    public async getKey(query: IDBValidKey | IDBKeyRange): Promise<IDBValidKey | undefined>
    {
        return this.promesify(this.store.getKey, query);
    }

    public index(name: string): IDBIndex
    {
        return this.store.index(name);
    }

    public async openCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): Promise<IDBCursorWithValue | null>
    {
        return this.promesify(this.store.openCursor, query, direction);
    }

    public async openKeyCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): Promise<IDBCursor | null>
    {
        return this.promesify(this.store.openKeyCursor, query, direction);
    }

    public async put(value: T, key?: IDBValidKey): Promise<IDBValidKey>
    {
        return this.promesify(this.store.put, value, key);
    }
}
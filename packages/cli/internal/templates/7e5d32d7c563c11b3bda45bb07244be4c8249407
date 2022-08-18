import Enumerable from "@surface/enumerable";
import Connection from "../context/connection";
import Database   from "../context/database";
import Store      from "../context/store";

// eslint-disable-next-line @typescript-eslint/ban-types
export default abstract class Repository<T extends { id: string }>
{
    protected abstract storeName: string;

    public constructor(protected readonly connection: Connection)
    { }

    private static update(database: IDBDatabase)
    {
        database.createObjectStore("user", { keyPath: "id" });
        database.createObjectStore("todo", { keyPath: "id" });
    }

    protected open(version?: number): Promise<Database>
    {
        return this.connection.open("app-db", version, { upgrade: Repository.update });
    }

    protected async objectStore(mode: IDBTransactionMode): Promise<Store<T>>
    {
        return (await this.open()).objectStore<T>(this.storeName, mode);
    }

    public async create(entity: T): Promise<void>
    {
        const store = await this.objectStore("readwrite");

        await store.add(entity);
    }

    public async delete(key: string): Promise<void>
    {
        const store = await this.objectStore("readwrite");

        await store.delete(key);
    }

    public async get(key: string): Promise<T | null>
    {
        const store = await this.objectStore("readonly");

        return await store.get(key);
    }

    public async getAll(): Promise<Enumerable<T>>
    {
        const store = await this.objectStore("readonly");

        return Enumerable.from(await store.getAll());
    }

    public async update(entity: T): Promise<void>
    {
        const store = await this.objectStore("readwrite");

        await store.put(entity);
    }
}
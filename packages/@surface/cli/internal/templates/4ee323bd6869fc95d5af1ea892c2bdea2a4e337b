/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Database from "./database";

export interface IHandler
{
    upgrade?
    (
        database:    IDBDatabase,
        oldVersion:  number,
        newVersion:  number | null,
        transaction: IDBTransaction,
    ): void;
    blocked?(): void;
    blocking?(): void;
    terminated?(): void;
  }

export default class Connection
{
    public open(name: string, version?: number, handler: IHandler = { }): Promise<Database>
    {
        return new Promise
        (
            (resolve, reject) =>
            {
                const request = indexedDB.open(name, version);

                if (handler.upgrade)
                {
                    const onUpgradeneeded = (event: IDBVersionChangeEvent): void =>
                    {
                        handler.upgrade!(request.result, event.oldVersion, event.newVersion, request.transaction!);
                    }

                    request.addEventListener("upgradeneeded", onUpgradeneeded);
                }

                if (handler.blocked) request.addEventListener('blocked', () => handler.blocked!());

                const onSuccess = (): void =>
                {
                    if (handler.terminated) request.result.addEventListener('close', () => handler.terminated!());
                    if (handler.blocking) request.result.addEventListener('versionchange', () => handler.blocking!());

                    removeEvents();

                    resolve(new Database(request.result));
                }

                const onError = (): void =>
                {
                    removeEvents();

                    reject(request.error);
                }

                const removeEvents = (): void =>
                {
                    request.removeEventListener("success", onSuccess);
                    request.removeEventListener("error", onError);
                }

                request.addEventListener("success", onSuccess);
                request.addEventListener("error", onError);
            }
        );
    }
}
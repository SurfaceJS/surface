import type IGetSetupSync from "./get-setup-sync.js";

export default interface IGetSetup<TResult = unknown> extends IGetSetupSync<TResult>
{

    /** Configures promise resolved when property is accessed. */
    resolve(value: Awaited<TResult>): void;

    /** Configures promise rejected when property is accessed. */
    reject(reason?: unknown): void;
}

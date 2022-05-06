import type IGetSetupSync from "./get-setup-sync.js";

export default interface IGetSetup<TResult = unknown> extends IGetSetupSync<TResult>
{
    resolve(value: Awaited<TResult>): void;
    reject(reason?: unknown): void;
}
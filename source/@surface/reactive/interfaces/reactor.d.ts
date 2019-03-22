import { Indexer } from "@surface/core";

export default interface IReactor
{
    notify<TTarget extends Indexer, TKey extends keyof TTarget>(target: TTarget, key: TKey): void;
}
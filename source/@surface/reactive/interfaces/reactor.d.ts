import { Indexer, Nullable } from "@surface/core";
import ISubscription from "./subscription";

export default interface IReactor
{
    notify<TTarget extends Indexer, TKey extends keyof TTarget>(target: TTarget, key: TKey): void;
    setSubscription(key: string, subscription: ISubscription): void;
}
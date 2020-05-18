import { Indexer }   from "@surface/core";
import ISubscription from "./subscription";

export default interface IPropertySubscription<TTarget extends Indexer = Indexer> extends ISubscription
{
    onUnsubscribe(action: () => void): void;
    update(target: TTarget): void;
}
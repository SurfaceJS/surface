import { Indexer }   from "@surface/core";
import ISubscription from "./subscription";

export default interface IPropertySubscription extends ISubscription
{
    update(target: Indexer): void;
}
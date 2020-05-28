import { Indexer } from "@surface/core";
import IListener   from "./listener";

export default interface IPropertyListener<T = unknown, TTarget extends Indexer = Indexer> extends IListener<T>
{
    update(target: TTarget): void;
}
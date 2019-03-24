import { Indexer } from "@surface/core";
import IListener from "./listener";

export default interface IPropertyListener<T = unknown> extends IListener<T>
{
    update(target: Indexer): void;
}
import { Indexer } from "@surface/core";
import IListener from "./listener";

export default interface IPropertyListener extends IListener
{
    update(target: Indexer): void;
}
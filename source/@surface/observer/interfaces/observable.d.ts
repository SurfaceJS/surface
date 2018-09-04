import { NOTIFIER, OBSERVERS } from "../symbols";
import Observer                from "..";

export default interface IObservable
{
    [NOTIFIER]?:  boolean;
    [OBSERVERS]?: Map<string|symbol, Observer>;
}
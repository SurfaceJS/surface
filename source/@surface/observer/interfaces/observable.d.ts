import { NOTIFYING, OBSERVERS } from "../symbols";
import Observer                 from "..";

export default interface IObservable extends Object
{
    [NOTIFYING]?: boolean;
    [OBSERVERS]?: Map<string|symbol, Observer>;
}
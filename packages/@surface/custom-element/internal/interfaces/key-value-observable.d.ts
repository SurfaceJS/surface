import type { Observables } from "../types/observable";
import type IObservable     from "./observable";

export default interface IKeyValueObservable extends IObservable
{
    keyObservables: Observables;
}
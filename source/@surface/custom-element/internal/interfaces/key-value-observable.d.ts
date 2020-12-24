import type { Observables } from "../types";
import type IObservable     from "./observable";

export default interface IKeyValueObservable extends IObservable
{
    keyObservables: Observables;
}
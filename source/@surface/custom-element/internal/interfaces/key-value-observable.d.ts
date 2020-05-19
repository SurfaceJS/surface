import { Observables } from "../types";
import IObservable     from "./observable";

export default interface IKeyValueObservable extends IObservable
{
    keyObservables: Observables;
}
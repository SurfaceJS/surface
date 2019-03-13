import { Indexer, Nullable } from "../../core";
import IObserver             from "./observer";
import ISubscription         from "./subscription";

export default interface ISubject
{
    addDependency(dependency: ISubject): void;
    notify(): void;
    subscribe(observer: IObserver): ISubscription;
    unsubscribe(observer: IObserver): void;
}
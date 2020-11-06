import { Delegate } from "../types";
import IDisposable  from "./disposable";

export default interface IEventListener<TValue = unknown> extends IDisposable
{
    subscribe(listerner: Delegate<[TValue]>): { unsubscribe: () => void };
    unsubscribe(listerner: Delegate<[TValue]>): void;
}
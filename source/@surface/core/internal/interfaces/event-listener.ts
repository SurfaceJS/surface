import { Action1 } from "../types";

export default interface IEventListener<TValue = unknown>
{
    subscribe(listerner: Action1<TValue>): { unsubscribe: () => void }
    unsubscribe(listerner: Action1<TValue>): void;
}
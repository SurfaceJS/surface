import { Delegate } from "../types";

export default interface IEventListener<TValue = unknown>
{
    subscribe(listerner: Delegate<[TValue]>): { unsubscribe: () => void };
    unsubscribe(listerner: Delegate<[TValue]>): void;
}
import Observer                 from ".";
import IObservable              from "./interfaces/observable";
import { NOTIFYING, OBSERVERS } from "./symbols";

export function notify<T extends IObservable, K extends keyof T>(target: T, key: K|symbol): void
{
    const observer = observe(target, key as keyof IObservable);

    target[NOTIFYING] = true;

    observer.notify();

    target[NOTIFYING] = false;
}

export function observe<T extends IObservable, K extends keyof T>(target: T, key: K|symbol): Observer;
export function observe(target: IObservable, key: string|symbol): Observer
{
    const observers = target[OBSERVERS] = target[OBSERVERS] || new Map<string|symbol, Observer>();

    if (!observers.has(key))
    {
        observers.set(key, new Observer());
    }

    return observers.get(key)!;
}
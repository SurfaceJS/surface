import Observer                from ".";
import IObservable             from "./interfaces/observable";
import { NOTIFIER, OBSERVERS } from "./symbols";

export function notify<T extends object, K extends keyof T>(target: T, key: K): void;
export function notify(target: IObservable, key: string|symbol): void;
export function notify(target: IObservable, key: string|symbol): void
{
    const observer = observe(target, key);

    target[NOTIFIER] = true;

    observer.notify();

    target[NOTIFIER] = false;
}

export function observe<T extends object, K extends keyof T>(target: T, key: K): Observer;
export function observe(target: IObservable, key: string|symbol): Observer;
export function observe(target: IObservable, key: string|symbol): Observer
{
    const observers = target[OBSERVERS] = target[OBSERVERS] || new Map<string|symbol, Observer>();

    if (!observers.has(key))
    {
        observers.set(key, new Observer());
    }

    return observers.get(key)!;
}
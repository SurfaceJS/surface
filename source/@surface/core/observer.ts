import { Action1 } from ".";

export default class Observer
{
    private listeners: Array<Action1<unknown>> = [];

    public notify(value?: unknown): void
    {
        this.listeners.forEach(listener => listener(value));
    }

    public subscribe(action: Action1<unknown>): void
    {
        this.listeners.push(action);
    }

    public unsubscribe(action: Action1<unknown>): void
    {
        this.listeners = this.listeners.filter(x => x != action);
    }
}
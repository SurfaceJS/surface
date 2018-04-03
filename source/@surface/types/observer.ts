import { Action1, Unknown } from ".";

export default class Observer
{
    private observers: Array<Action1<Unknown>> = [];

    public subscribe(action: Action1<Unknown>): void
    {
        this.observers.push(action);
    }

    public unsubscribe(action: Action1<Unknown>): void
    {
        this.observers = this.observers.filter(x => x != action);
    }

    public notify(value?: Unknown): void
    {
        this.observers.forEach(observer => observer(value));
    }
}
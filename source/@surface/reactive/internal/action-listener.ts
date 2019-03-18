import { Action1 } from "@surface/core";
import IListener   from "../interfaces/listener";

export default class ActionListener<TValue = unknown> implements IListener
{
    public constructor(private readonly listener: Action1<TValue>)
    { }

    public notify(value: TValue): void
    {
        this.listener(value);
    }

    public toString(): string
    {
        return this.listener.toString();
    }
}
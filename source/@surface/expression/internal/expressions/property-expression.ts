import IExpression from "../../interfaces/expression";

import { Nullable } from "@surface/types";

export default class PropertyExpression implements IExpression
{
    private readonly _key: IExpression;
    public get key(): IExpression
    {
        return this._key;
    }

    private readonly _value: IExpression;
    public get value(): IExpression
    {
        return this._value;
    }

    public constructor(key: IExpression, value: IExpression)
    {
        this._key   = key;
        this._value = value;
    }

    public evaluate(): Nullable<Object>
    {
        return this.value.evaluate();
    }
}
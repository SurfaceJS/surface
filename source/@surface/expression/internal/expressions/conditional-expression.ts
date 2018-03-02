import IExpression from "../../interfaces/expression";

import { Nullable } from "@surface/types";

export default class ConditionalExpression implements IExpression
{
    private _condition: IExpression;
    public get condition(): IExpression
    {
        return this._condition;
    }

    private readonly _falsy: IExpression;
    public get falsy(): IExpression
    {
        return this._falsy;
    }

    private readonly _truthy: IExpression;
    public get truthy(): IExpression
    {
        return this._truthy;
    }

    public constructor(condition: IExpression, truthy: IExpression, falsy: IExpression)
    {
        this._condition = condition;
        this._falsy     = falsy;
        this._truthy    = truthy;
    }

    public evaluate(): Nullable<Object>
    {
        return this.condition.evaluate() ? this.truthy.evaluate() : this.falsy.evaluate();
    }
}
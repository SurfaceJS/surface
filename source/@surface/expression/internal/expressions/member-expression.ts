import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";

import { Nullable } from "@surface/types";

export default class MemberExpression implements IExpression
{
    private readonly _key: IExpression;
    public get key(): IExpression
    {
        return this._key;
    }

    private readonly _target: IExpression;
    public get target(): IExpression
    {
        return this._target;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Member;
    }

    public constructor(target: IExpression, key: IExpression)
    {
        this._key    = key;
        this._target = target;
    }

    public evaluate(): Nullable<Object>
    {
        return (this.target.evaluate() as Object)[`${this.key.evaluate()}`];
    }
}
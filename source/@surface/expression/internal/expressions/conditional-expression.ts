import { Nullable }   from "@surface/core";
import { coalesce }   from "@surface/core/common/generic";
import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";

export default class ConditionalExpression implements IExpression
{
    private _cache: Nullable<unknown>;
    public get cache(): unknown
    {
        return coalesce(this._cache, () => this.evaluate());
    }

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

    public get type(): ExpressionType
    {
        return ExpressionType.Conditional;
    }

    public constructor(condition: IExpression, truthy: IExpression, falsy: IExpression)
    {
        this._condition = condition;
        this._falsy     = falsy;
        this._truthy    = truthy;
    }

    public evaluate(): unknown
    {
        return this._cache = this.condition.evaluate() ? this.truthy.evaluate() : this.falsy.evaluate();
    }
}
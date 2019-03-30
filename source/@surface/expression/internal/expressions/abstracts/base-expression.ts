import { Nullable }   from "@surface/core";
import { coalesce }   from "@surface/core/common/generic";
import ExpressionType from "../../../expression-type";
import IExpression    from "../../../interfaces/expression";

export default abstract class BaseExpression<T = unknown> implements IExpression
{
    protected _cache: Nullable<T>;
    public get cache(): T
    {
        return coalesce(this._cache, () => this.evaluate());
    }

    public abstract type: ExpressionType;

    public abstract evaluate(): T;
}

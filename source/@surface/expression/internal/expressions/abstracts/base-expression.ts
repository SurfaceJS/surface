import { Nullable } from "@surface/core";
import { coalesce } from "@surface/core/common/generic";
import IExpression  from "../../../interfaces/expression";
import NodeType     from "../../../node-type";

export default abstract class BaseExpression<T = unknown> implements IExpression
{
    protected _cache: Nullable<T>;
    public get cache(): T
    {
        return coalesce(this._cache, () => this.evaluate());
    }

    public abstract type: NodeType;

    public abstract evaluate(): T;
}

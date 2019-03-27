import { Indexer, Nullable } from "@surface/core";
import { coalesce }          from "@surface/core/common/generic";
import ExpressionType        from "../../expression-type";
import IExpression           from "../../interfaces/expression";

export default class MemberExpression implements IExpression
{
    private _cache: Nullable<unknown>;
    public get cache(): unknown
    {
        return coalesce(this._cache, () => this.evaluate());
    }

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

    public evaluate(): unknown
    {
        return this._cache = (this.target.evaluate() as Indexer)[`${this.key.evaluate()}`];
    }
}
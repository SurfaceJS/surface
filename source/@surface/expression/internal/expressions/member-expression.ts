import { Indexer }    from "@surface/core";
import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";

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

    public evaluate(): unknown
    {
        return (this.target.evaluate() as Indexer)[`${this.key.evaluate()}`];
    }
}
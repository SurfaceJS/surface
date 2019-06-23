import { Indexer }      from "@surface/core";
import ExpressionType   from "../../expression-type";
import IExpression      from "../../interfaces/expression";
import BaseExpression   from "./abstracts/base-expression";

export default class MemberExpression extends BaseExpression
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
        super();

        this._key    = key;
        this._target = target;
    }

    public evaluate(): unknown
    {
        return this._cache = (this.target.evaluate() as Indexer)[`${this.key.evaluate()}`];
    }

    public toString(): string
    {
        const key = this.key.evaluate();

        return `${this.target}${typeof key == "string" && /^[^\d][$\w]+$/.test(key) ? `.${key}` : `[\"${key}\"]`}`;
    }
}
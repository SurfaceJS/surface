import { Indexer }      from "@surface/core";
import ExpressionType   from "../../expression-type";
import IExpression      from "../../interfaces/expression";
import BaseExpression   from "./abstracts/base-expression";

export default class MemberExpression extends BaseExpression
{
    private readonly _computed: boolean;
    public get computed(): boolean
    {
        return this._computed;
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

    public constructor(target: IExpression, key: IExpression, computed: boolean)
    {
        super();

        this._key      = key;
        this._target   = target;
        this._computed = computed;
    }

    public evaluate(): unknown
    {
        return this._cache = (this.target.evaluate() as Indexer)[`${this.key.evaluate()}`];
    }

    public toString(): string
    {
        return `${this.target}${this.computed ? `[${this.key}]` : `.${this.key.evaluate()}`}`;
    }
}
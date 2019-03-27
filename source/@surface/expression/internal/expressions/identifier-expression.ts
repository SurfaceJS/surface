import { Indexer, Nullable } from "@surface/core";
import { coalesce }          from "@surface/core/common/generic";
import ExpressionType        from "../../expression-type";
import IExpression           from "../../interfaces/expression";

export default class IdentifierExpression implements IExpression
{
    private _cache: Nullable<unknown>;
    public get cache(): unknown
    {
        return coalesce(this._cache, () => this.evaluate());
    }

    private readonly _context: Indexer;
    public get context(): Indexer
    {
        return this._context;
    }

    private _name: string;
    public get name(): string
    {
        return this._name;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Identifier;
    }

    public constructor(context: object, name: string)
    {
        if (!(name in context))
        {
            throw new Error(`The identifier ${name} does not exist in this context`);
        }

        this._context = context;
        this._name    = name;
    }

    public evaluate(): unknown
    {
        return this._cache = this.context[this.name];
    }
}
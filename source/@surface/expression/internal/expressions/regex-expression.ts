import { Nullable }   from "@surface/core";
import { coalesce }   from "@surface/core/common/generic";
import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";

export default class RegexExpression implements IExpression
{
    private _cache: Nullable<RegExp>;
    public get cache(): RegExp
    {
        return coalesce(this._cache, () => this.evaluate());
    }

    private readonly _flags: string;
    public get flags(): string
    {
        return this._flags;
    }

    private readonly _pattern: string;
    public get pattern(): string
    {
        return this._pattern;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Regex;
    }

    public constructor(pattern: string, flags: string)
    {
        this._flags   = flags;
        this._pattern = pattern;
    }

    public evaluate(): RegExp
    {
        return this._cache = new RegExp(this.pattern, this.flags);
    }
}
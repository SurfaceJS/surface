import ExpressionType from "../../expression-type";
import BaseExpression from "./abstracts/base-expression";

export default class RegexExpression extends BaseExpression<RegExp>
{
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
        super();

        this._flags   = flags;
        this._pattern = pattern;
    }

    public evaluate(): RegExp
    {
        return this._cache = new RegExp(this.pattern, this.flags);
    }
}
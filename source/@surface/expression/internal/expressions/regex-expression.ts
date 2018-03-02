import IExpression from "../../interfaces/expression";

export default class RegexExpression implements IExpression
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

    public constructor(pattern: string, flags: string)
    {
        this._flags    = flags;
        this._pattern = pattern;
    }

    public evaluate(): RegExp
    {
        return new RegExp(this.pattern, this.flags);
    }
}
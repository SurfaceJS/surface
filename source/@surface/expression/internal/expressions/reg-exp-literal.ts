import { hasValue }   from "@surface/core";
import ILiteral       from "../interfaces/literal";
import IRegExpLiteral from "../interfaces/reg-exp-literal";
import NodeType       from "../node-type";

export default class RegExpLiteral implements ILiteral
{
    private cache: RegExp | null = null;

    private _flags: string;
    public get flags(): string
    {
        return this._flags;
    }

    /* istanbul ignore next */
    public set flags(value: string)
    {
        this._flags = value;
    }

    private _pattern: string;
    public get pattern(): string
    {
        return this._pattern;
    }

    /* istanbul ignore next */
    public set pattern(value: string)
    {
        this._pattern = value;
    }

    public get type(): NodeType
    {
        return NodeType.RegExpLiteral;
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public get value(): null
    {
        return null;
    }

    /* istanbul ignore next */
    public set value(_: null)
    { /* Compatibility */ }

    public constructor(pattern: string, flags: string)
    {
        this._flags   = flags;
        this._pattern = pattern;
    }

    public clone(): IRegExpLiteral
    {
        return new RegExpLiteral(this.pattern, this.flags);
    }

    public evaluate(_?: object, useCache?: boolean): RegExp
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        return this.cache = new RegExp(this.pattern, this.flags);
    }

    public toString(): string
    {
        return `/${this.pattern}/${this.flags}`;
    }
}
import { Indexer, Nullable } from "@surface/core";
import { hasValue }          from "@surface/core/common/generic";
import ILiteral              from "../../interfaces/literal";
import NodeType              from "../../node-type";

export default class RegExpLiteral implements ILiteral
{
    private cache: Nullable<RegExp>;

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

    public evaluate(_?: Indexer, useCache?: boolean): RegExp
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
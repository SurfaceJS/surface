import type IArrayPattern from "../interfaces/array-pattern";
import type IPattern      from "../interfaces/pattern";
import NodeType           from "../node-type.js";
import { PATTERN }        from "../symbols.js";

export default class ArrayPattern implements IPattern
{
    private _elements: (IPattern | null)[];

    public [PATTERN]: void;

    public get elements(): (IPattern | null)[]
    {
        return this._elements;
    }

    /* c8 ignore next 4 */
    public set elements(value: (IPattern | null)[])
    {
        this._elements = value;
    }

    public get type(): NodeType
    {
        return NodeType.ArrayPattern;
    }

    public constructor(elements: (IPattern | null)[])
    {
        this._elements = elements;
    }

    public clone(): IArrayPattern
    {
        return new ArrayPattern(this.elements.map(x => x?.clone() ?? null));
    }

    public toString(): string
    {
        return `[${this.elements.map(x => (x ??  "").toString()).join(", ")}]`;
    }
}
import IArrayPattern from "../../interfaces/array-pattern";
import IPattern      from "../../interfaces/pattern";
import NodeType      from "../../node-type";
import { PATTERN }   from "../../symbols";

export default class ArrayPattern implements IPattern
{
    private _elements: Array<IPattern|null>;

    public [PATTERN]: void;

    public get elements(): Array<IPattern|null>
    {
        return this._elements;
    }

    /* istanbul ignore next */
    public set elements(value: Array<IPattern|null>)
    {
        this._elements = value;
    }

    public get type(): NodeType
    {
        return NodeType.ArrayPattern;
    }

    public constructor(elements: Array<IPattern|null>)
    {
        this._elements = elements;
    }

    public clone(): IArrayPattern
    {
        return new ArrayPattern(this.elements.map(x => x?.clone() ?? null));
    }

    public toString(): string
    {
        return `[${this.elements.map(x => (x ||  "").toString()).join(", ")}]`;
    }
}
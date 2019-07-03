import IPattern from "../../interfaces/pattern";
import NodeType from "../../node-type";

export default class ArrayPattern implements IPattern
{
    private _elements: Array<IPattern>;
    public get elements(): Array<IPattern>
    {
        return this._elements;
    }

    public get type(): NodeType
    {
        return NodeType.ArrayPattern;
    }

    public constructor(elements: Array<IPattern>)
    {
        this._elements = elements;
    }

    public toString(): string
    {
        return `[${this.elements.map(x => x.toString()).join(", ")}]`;
    }
}
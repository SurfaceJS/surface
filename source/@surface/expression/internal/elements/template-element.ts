import INode    from "../../interfaces/node";
import NodeType from "../../node-type";

export default class TemplateElement implements INode
{
    private readonly _cooked: string;
    public get cooked(): string
    {
        return this._cooked;
    }

    private readonly _raw: string;
    public get raw(): string
    {
        return this._raw;
    }

    private readonly _tail: boolean;
    public get tail(): boolean
    {
        return this._tail;
    }

    public get type(): NodeType
    {
        return NodeType.TemplateElement;
    }

    public constructor(cooked: string, raw: string, tail: boolean)
    {
        this._cooked = cooked;
        this._raw    = raw;
        this._tail   = tail;
    }

    public toString(): string
    {
        return "";
    }
}
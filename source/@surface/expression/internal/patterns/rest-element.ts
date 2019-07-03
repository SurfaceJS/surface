import INode    from "../../interfaces/node";
import IPattern from "../../interfaces/pattern";
import NodeType from "../../node-type";

export default class RestElement implements IPattern
{
    private readonly _argument: INode;
    public get argument(): INode
    {
        return this._argument;
    }

    public get type(): NodeType
    {
        return NodeType.Rest;
    }

    public constructor(argument: INode)
    {
        this._argument = argument;
    }

    public toString(): string
    {
        return `...${this.argument}`;
    }
}
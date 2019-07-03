import IExpression from "../../interfaces/expression";
import INode       from "../../interfaces/node";
import NodeType    from "../../node-type";

export default class SpreadElement implements INode
{
    private readonly _argument: IExpression;
    public get argument(): IExpression
    {
        return this._argument;
    }

    public get type(): NodeType
    {
        return NodeType.Spread;
    }

    public constructor(argument: IExpression)
    {
        this._argument = argument;
    }

    public toString(): string
    {
        return `...${this.argument}`;
    }
}
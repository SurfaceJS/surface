import IExpression from "../../interfaces/expression";
import INode       from "../../interfaces/node";
import NodeType    from "../../node-type";

export default class SpreadElement implements INode
{
    private _argument: IExpression;
    public get argument(): IExpression
    {
        return this._argument;
    }

    /* istanbul ignore next */
    public set argument(value: IExpression)
    {
        this._argument = value;
    }

    public get type(): NodeType
    {
        return NodeType.SpreadElement;
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
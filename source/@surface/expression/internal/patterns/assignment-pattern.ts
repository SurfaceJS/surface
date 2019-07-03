import IExpression           from "../../interfaces/expression";
import IIdentifierExpression from "../../interfaces/identifier-expression";
import IPattern              from "../../interfaces/pattern";
import NodeType              from "../../node-type";

export default class AssignmentPattern implements IPattern
{
    private readonly _left:  IIdentifierExpression;
    private readonly _right: IExpression;

    public get left(): IExpression
    {
        return this._left;
    }

    public get right(): IExpression
    {
        return this._right;
    }

    public get type(): NodeType
    {
        return NodeType.Assignment;
    }

    public constructor(left: IIdentifierExpression, right: IExpression)
    {
        this._left     = left;
        this._right    = right;
    }

    public toString(): string
    {
        return `${this.left} = ${this.right}`;
    }
}
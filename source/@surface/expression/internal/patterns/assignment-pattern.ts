import IExpression from "../../interfaces/expression";
import IPattern    from "../../interfaces/pattern";
import NodeType    from "../../node-type";
import { PATTERN } from "../../symbols";

export default class AssignmentPattern implements IPattern
{
    private readonly _left:  IPattern;
    private readonly _right: IExpression;

    public [PATTERN]: void;

    public get left(): IPattern
    {
        return this._left;
    }

    public get right(): IExpression
    {
        return this._right;
    }

    public get type(): NodeType
    {
        return NodeType.AssignmentPattern;
    }

    public constructor(left: IPattern, right: IExpression)
    {
        this._left  = left;
        this._right = right;
    }

    public toString(): string
    {
        return `${this.left} = ${this.right}`;
    }
}
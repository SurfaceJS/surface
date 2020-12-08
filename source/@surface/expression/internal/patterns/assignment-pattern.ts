import type IAssignmentPattern from "../interfaces/assignment-pattern";
import type IExpression        from "../interfaces/expression";
import type IPattern           from "../interfaces/pattern";
import NodeType                from "../node-type.js";
import { PATTERN }             from "../symbols.js";

export default class AssignmentPattern implements IPattern
{
    private _left:  IPattern;
    private _right: IExpression;

    public [PATTERN]: void;

    public get left(): IPattern
    {
        return this._left;
    }

    /* istanbul ignore next */
    public set left(value: IPattern)
    {
        this._left = value;
    }

    public get right(): IExpression
    {
        return this._right;
    }

    /* istanbul ignore next */
    public set right(value: IExpression)
    {
        this._right = value;
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

    public clone(): IAssignmentPattern
    {
        return new AssignmentPattern(this.left.clone(), this.right.clone());
    }

    public toString(): string
    {
        return `${this.left} = ${this.right}`;
    }
}
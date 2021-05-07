import type IAssignmentPattern from "../interfaces/assignment-pattern";
import type IExpression        from "../interfaces/expression";
import type IPattern           from "../interfaces/pattern";
import Messages from "../messages.js";
import NodeType                from "../node-type.js";
import { PATTERN }             from "../symbols.js";
import TypeGuard from "../type-guard.js";

export default class AssignmentPattern implements IPattern
{
    private _left:  IPattern;
    private _right: IExpression;

    public [PATTERN]: void;

    public get left(): IPattern
    {
        return this._left;
    }

    /* c8 ignore next 4 */
    public set left(value: IPattern)
    {
        this._left = value;
    }

    public get right(): IExpression
    {
        return this._right;
    }

    /* c8 ignore next 4 */
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

    public evaluate(scope: object, value: unknown): object
    {
        if (TypeGuard.isIdentifier(this.left))
        {
            return { [this.left.name]: value ?? this.right.evaluate(scope) };
        }

        throw new Error(Messages.illegalPropertyInDeclarationContext);
    }

    public toString(): string
    {
        return `${this.left} = ${this.right}`;
    }
}
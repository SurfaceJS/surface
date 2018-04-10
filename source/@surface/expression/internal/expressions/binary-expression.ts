import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";

import { Func2, Nullable } from "@surface/types";

const binaryFunctions =
{
    "+":          (left: number, right: number)   => left +          right,
    "-":          (left: number, right: number)   => left -          right,
    "*":          (left: number, right: number)   => left *          right,
    "/":          (left: number, right: number)   => left /          right,
    "%":          (left: number, right: number)   => left %          right,
    "**":         (left: number, right: number)   => left **         right,
    "&":          (left: number, right: number)   => left &          right,
    "|":          (left: number, right: number)   => left |          right,
    "^":          (left: number, right: number)   => left ^          right,
    "<<":         (left: number, right: number)   => left <<         right,
    ">>":         (left: number, right: number)   => left >>         right,
    ">>>":        (left: number, right: number)   => left >>>        right,
    "&&":         (left: Object, right: Object)   => left &&         right,
    "||":         (left: Object, right: Object)   => left ||         right,
    "==":         (left: Object, right: Object)   => left ==         right,
    "===":        (left: Object, right: Object)   => left ===        right,
    "!=":         (left: Object, right: Object)   => left !=         right,
    "!==":        (left: Object, right: Object)   => left !==        right,
    "<=":         (left: Object, right: Object)   => left <=         right,
    ">=":         (left: Object, right: Object)   => left >=         right,
    "<":          (left: Object, right: Object)   => left <          right,
    ">":          (left: Object, right: Object)   => left >          right,
    "in":         (left: string, right: Function) => left in         right,
    "instanceof": (left: Object, right: Function) => left instanceof right,
};

export default class BinaryExpression implements IExpression
{
    private readonly operation: Func2<Nullable<Object>, Nullable<Object>, Nullable<Object>>;

    private readonly _left: IExpression;
    public get left(): IExpression
    {
        return this._left;
    }

    private readonly _operator: string;
    public get operator(): string
    {
        return this._operator;
    }

    private readonly _right: IExpression;
    public get right(): IExpression
    {
        return this._right;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Binary;
    }

    public constructor(left: IExpression, right: IExpression, operator: string)
    {
        this._left     = left;
        this._operator = operator;
        this._right    = right;
        this.operation = binaryFunctions[this.operator];
    }

    public evaluate(): Nullable<Object>
    {
        return this.operation(this.left.evaluate(), this.right.evaluate());
    }
}
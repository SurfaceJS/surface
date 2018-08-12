import { Func2 }          from "@surface/core";
import ExpressionType     from "../../expression-type";
import IExpression        from "../../interfaces/expression";
import { BinaryOperator } from "../../types";


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
    private readonly operation: Func2<unknown, unknown, unknown>;

    private readonly _left: IExpression;
    public get left(): IExpression
    {
        return this._left;
    }

    private readonly _operator: BinaryOperator;
    public get operator(): BinaryOperator
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

    public constructor(left: IExpression, right: IExpression, operator: BinaryOperator)
    {
        this._left     = left;
        this._operator = operator;
        this._right    = right;
        this.operation = binaryFunctions[this.operator] as Func2<unknown, unknown, unknown>;
    }

    public evaluate(): unknown
    {
        return this.operation(this.left.evaluate(), this.right.evaluate());
    }
}
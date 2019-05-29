import { Func2 }          from "@surface/core";
import ExpressionType     from "../../expression-type";
import IExpression        from "../../interfaces/expression";
import { BinaryOperator } from "../../types";
import BaseExpression     from "./abstracts/base-expression";

const binaryFunctions =
{
    "+":          (left: IExpression, right: IExpression) => (left.evaluate() as number) +          (right.evaluate() as number),
    "-":          (left: IExpression, right: IExpression) => (left.evaluate() as number) -          (right.evaluate() as number),
    "*":          (left: IExpression, right: IExpression) => (left.evaluate() as number) *          (right.evaluate() as number),
    "/":          (left: IExpression, right: IExpression) => (left.evaluate() as number) /          (right.evaluate() as number),
    "%":          (left: IExpression, right: IExpression) => (left.evaluate() as number) %          (right.evaluate() as number),
    "**":         (left: IExpression, right: IExpression) => (left.evaluate() as number) **         (right.evaluate() as number),
    "&":          (left: IExpression, right: IExpression) => (left.evaluate() as number) &          (right.evaluate() as number),
    "|":          (left: IExpression, right: IExpression) => (left.evaluate() as number) |          (right.evaluate() as number),
    "^":          (left: IExpression, right: IExpression) => (left.evaluate() as number) ^          (right.evaluate() as number),
    "<<":         (left: IExpression, right: IExpression) => (left.evaluate() as number) <<         (right.evaluate() as number),
    ">>":         (left: IExpression, right: IExpression) => (left.evaluate() as number) >>         (right.evaluate() as number),
    ">>>":        (left: IExpression, right: IExpression) => (left.evaluate() as number) >>>        (right.evaluate() as number),
    "&&":         (left: IExpression, right: IExpression) => (left.evaluate() as Object) &&         (right.evaluate() as Object),
    "||":         (left: IExpression, right: IExpression) => (left.evaluate() as Object) ||         (right.evaluate() as Object),
    "==":         (left: IExpression, right: IExpression) => (left.evaluate() as Object) ==         (right.evaluate() as Object),
    "===":        (left: IExpression, right: IExpression) => (left.evaluate() as Object) ===        (right.evaluate() as Object),
    "!=":         (left: IExpression, right: IExpression) => (left.evaluate() as Object) !=         (right.evaluate() as Object),
    "!==":        (left: IExpression, right: IExpression) => (left.evaluate() as Object) !==        (right.evaluate() as Object),
    "<=":         (left: IExpression, right: IExpression) => (left.evaluate() as Object) <=         (right.evaluate() as Object),
    ">=":         (left: IExpression, right: IExpression) => (left.evaluate() as Object) >=         (right.evaluate() as Object),
    "<":          (left: IExpression, right: IExpression) => (left.evaluate() as Object) <          (right.evaluate() as Object),
    ">":          (left: IExpression, right: IExpression) => (left.evaluate() as Object) >          (right.evaluate() as Object),
    "in":         (left: IExpression, right: IExpression) => (left.evaluate() as string) in         (right.evaluate() as Function),
    "instanceof": (left: IExpression, right: IExpression) => (left.evaluate() as Object) instanceof (right.evaluate() as Function),
};

export default class BinaryExpression extends BaseExpression
{
    private readonly operation: Func2<IExpression, IExpression, unknown>;

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
        super();

        this._left     = left;
        this._operator = operator;
        this._right    = right;
        this.operation = binaryFunctions[this.operator];
    }

    public evaluate(): unknown
    {
        return this._cache = this.operation(this.left, this.right);
    }
}
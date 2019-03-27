import { Func2, Nullable } from "@surface/core";
import { coalesce }        from "@surface/core/common/generic";
import ExpressionType      from "../../expression-type";
import IExpression         from "../../interfaces/expression";
import { BinaryOperator }  from "../../types";

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

export default class BinaryExpression implements IExpression
{
    private readonly operation: Func2<IExpression, IExpression, unknown>;

    private _cache: Nullable<unknown>;
    public get cache(): unknown
    {
        return coalesce(this._cache, () => this.evaluate());
    }

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
        this.operation = binaryFunctions[this.operator];
    }

    public evaluate(): unknown
    {
        return this._cache = this.operation(this.left, this.right);
    }
}
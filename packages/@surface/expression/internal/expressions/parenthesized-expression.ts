import type IExpression              from "../interfaces/expression";
import type IParenthesizedExpression from "../interfaces/parenthesized-expression";
import NodeType                      from "../node-type.js";

export default class ParenthesizedExpression implements IExpression
{
    private _argument: IExpression;
    public get argument(): IExpression
    {
        return this._argument;
    }

    /* c8 ignore next 4 */
    public set argument(value: IExpression)
    {
        this._argument = value;
    }

    public get type(): NodeType
    {
        return NodeType.ParenthesizedExpression;
    }

    public constructor(argument: IExpression)
    {
        this._argument = argument;
    }

    public clone(): IParenthesizedExpression
    {
        return new ParenthesizedExpression(this.argument.clone());
    }

    public evaluate(scope: object): unknown
    {
        return this.argument.evaluate(scope);
    }

    public toString(): string
    {
        return `(${this.argument})`;
    }
}
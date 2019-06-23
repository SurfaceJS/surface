import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";
import BaseExpression from "./abstracts/base-expression";

export default class TemplateExpression extends BaseExpression<string>
{
    private readonly _expressions: Array<IExpression>;
    public get expressions(): Array<IExpression>
    {
        return this._expressions;
    }
    private readonly _quasis: Array<string>;
    public get quasis(): Array<string>
    {
        return this._quasis;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Template;
    }

    public constructor(quasis: Array<string>, expressions: Array<IExpression>)
    {
        super();

        this._expressions = expressions;
        this._quasis      = quasis;
    }

    public evaluate(): string
    {
        let result = "";

        for (let i = 0; i < this.expressions.length; i++)
        {
            result = this.quasis[i] + `${this.expressions[i].evaluate()}`;
        }

        return this._cache = result + this.quasis[this.quasis.length - 1];
    }

    public toString(): string
    {
        let result = "";

        for (let i = 0; i < this.expressions.length; i++)
        {
            result = this.quasis[i] + `\$\{${this.expressions[i]}\}`;
        }

        return `\`${result + this.quasis[this.quasis.length - 1]}\``;
    }
}
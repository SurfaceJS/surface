import IExpression from "../../interfaces/expression";

export default class TemplateExpression implements IExpression
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

    public constructor(quasis: Array<string>, expressions: Array<IExpression>)
    {
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

        return result + this.quasis[this.quasis.length - 1];
    }
}
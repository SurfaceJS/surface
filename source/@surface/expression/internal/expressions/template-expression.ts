import IExpression    from "../../interfaces/expression";
import NodeType       from "../../node-type";
import BaseExpression from "./abstracts/base-expression";

export default class TemplateExpression extends BaseExpression<string>
{
    private _expressions: Array<IExpression>;
    public get expressions(): Array<IExpression>
    {
        return this._expressions;
    }

    public set expressions(value: Array<IExpression>)
    {
        this._expressions = value;
    }

    private _quasis: Array<string>;
    public get quasis(): Array<string>
    {
        return this._quasis;
    }

    public set quasis(value: Array<string>)
    {
        this._quasis = value;
    }

    public get type(): NodeType
    {
        return NodeType.Template;
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
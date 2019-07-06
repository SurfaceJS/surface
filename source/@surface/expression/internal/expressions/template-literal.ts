import IExpression      from "../../interfaces/expression";
import ITemplateElement from "../../interfaces/template-element";
import NodeType         from "../../node-type";
import BaseExpression   from "./abstracts/base-expression";

export default class TemplateLiteral extends BaseExpression<string>
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

    private _quasis: Array<ITemplateElement>;
    public get quasis(): Array<ITemplateElement>
    {
        return this._quasis;
    }

    public set quasis(value: Array<ITemplateElement>)
    {
        this._quasis = value;
    }

    public get type(): NodeType
    {
        return NodeType.TemplateLiteral;
    }

    public constructor(quasis: Array<ITemplateElement>, expressions: Array<IExpression>)
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
            result = this.quasis[i].cooked + `${this.expressions[i].evaluate()}`;
        }

        return this._cache = result + this.quasis[this.quasis.length - 1].cooked;
    }

    public toString(): string
    {
        let result = "";

        for (let i = 0; i < this.expressions.length; i++)
        {
            result = this.quasis[i].cooked + `\$\{${this.expressions[i]}\}`;
        }

        return `\`${result + this.quasis[this.quasis.length - 1].cooked}\``;
    }
}
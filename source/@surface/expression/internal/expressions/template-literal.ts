import { Indexer, Nullable, hasValue } from "@surface/core";
import IExpression                     from "../interfaces/expression";
import ITemplateElement                from "../interfaces/template-element";
import ITemplateLiteral                from "../interfaces/template-literal";
import NodeType                        from "../node-type";

export default class TemplateLiteral implements IExpression
{
    private cache: Nullable<string>;

    private _expressions: Array<IExpression>;
    public get expressions(): Array<IExpression>
    {
        return this._expressions;
    }

    /* istanbul ignore next */
    public set expressions(value: Array<IExpression>)
    {
        this._expressions = value;
    }

    private _quasis: Array<ITemplateElement>;
    public get quasis(): Array<ITemplateElement>
    {
        return this._quasis;
    }

    /* istanbul ignore next */
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
        this._expressions = expressions;
        this._quasis      = quasis;
    }

    public clone(): ITemplateLiteral
    {
        return new TemplateLiteral(this.quasis.map(x => x.clone()), this.expressions.map(x => x.clone()));
    }

    public evaluate(scope: Indexer, useCache?: boolean): string
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        let result = "";

        for (let i = 0; i < this.expressions.length; i++)
        {
            result = this.quasis[i].cooked + `${this.expressions[i].evaluate(scope, useCache)}`;
        }

        return this.cache = result + this.quasis[this.quasis.length - 1].cooked;
    }

    public toString(): string
    {
        let result = "";

        for (let i = 0; i < this.expressions.length; i++)
        {
            result = this.quasis[i].raw + `\$\{${this.expressions[i]}\}`;
        }

        return `\`${result + this.quasis[this.quasis.length - 1].raw}\``;
    }
}
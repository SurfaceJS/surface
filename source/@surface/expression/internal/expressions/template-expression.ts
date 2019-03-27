import { Nullable }   from "@surface/core";
import { coalesce }   from "@surface/core/common/generic";
import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";

export default class TemplateExpression implements IExpression
{
    private _cache: Nullable<string>;
    public get cache(): string
    {
        return coalesce(this._cache, () => this.evaluate());
    }

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
}
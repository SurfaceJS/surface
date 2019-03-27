import { Nullable }   from "@surface/core";
import { coalesce }   from "@surface/core/common/generic";
import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";

export default class ArrayExpression implements IExpression
{
    private readonly _elements: Array<IExpression>;

    private _cache: Nullable<Array<unknown>>;
    public get cache(): Array<unknown>
    {
        return coalesce(this._cache, () => this.evaluate());
    }

    public get elements(): Array<IExpression>
    {
        return this._elements;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Array;
    }

    public constructor(elements: Array<IExpression>)
    {
        this._elements = elements;
    }

    public evaluate(): Array<unknown>
    {
        return this._cache = this.elements.map(x => x.evaluate());
    }
}
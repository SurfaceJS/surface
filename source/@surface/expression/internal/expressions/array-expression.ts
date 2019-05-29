import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";
import BaseExpression from "./abstracts/base-expression";

export default class ArrayExpression extends BaseExpression<Array<unknown>>
{
    private readonly _elements: Array<IExpression>;

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
        super();
        this._elements = elements;
    }

    public evaluate(): Array<unknown>
    {
        return this._cache = this.elements.map(x => x.evaluate());
    }
}
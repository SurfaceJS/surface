import ExpressionType   from "../../expression-type";
import IExpression      from "../../interfaces/expression";
import BaseExpression   from "./abstracts/base-expression";
import SpreadExpression from "./spread-expression";

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
        const evaluation: Array<unknown> = [];

        for (const element of this.elements)
        {
            if (element instanceof SpreadExpression)
            {
                evaluation.push(...element.evaluate() as Array<unknown>);
            }
            else
            {
                evaluation.push(element.evaluate());
            }
        }

        return this._cache = evaluation;
    }

    public toString(): string
    {
        return `[${this.elements.map(x => x.type == ExpressionType.Spread ? `...${x}` : x.toString()).join(", ")}]`;
    }
}
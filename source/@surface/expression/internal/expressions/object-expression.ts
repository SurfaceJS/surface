import { Indexer }        from "@surface/core";
import ExpressionType     from "../../expression-type";
import BaseExpression     from "./abstracts/base-expression";
import PropertyExpression from "./property-expression";
import SpreadExpression   from "./spread-expression";

export default class ObjectExpression extends BaseExpression<Indexer>
{
    private readonly elements: Array<PropertyExpression|SpreadExpression>;

    public get properties(): Array<PropertyExpression>
    {
        return this.elements.filter(x => x instanceof PropertyExpression) as Array<PropertyExpression>;
    }

    public get spreads(): Array<SpreadExpression>
    {
        return this.elements.filter(x => x instanceof SpreadExpression) as Array<SpreadExpression>;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Object;
    }

    public constructor(elements: Array<PropertyExpression|SpreadExpression>)
    {
        super();

        this.elements = elements;
    }

    public evaluate(): Indexer
    {
        const evaluation: Indexer = { };

        for (const element of this.elements)
        {
            if (element instanceof PropertyExpression)
            {
                evaluation[element.key.evaluate() as string] = element.evaluate();
            }
            else
            {
                Object.assign(evaluation, element.evaluate());
            }
        }

        return this._cache = evaluation;
    }
}
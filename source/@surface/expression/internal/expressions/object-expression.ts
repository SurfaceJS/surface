import { Indexer }        from "@surface/core";
import ExpressionType     from "../../expression-type";
import BaseExpression     from "./abstracts/base-expression";
import PropertyExpression from "./property-expression";
import SpreadExpression   from "./spread-expression";

export default class ObjectExpression extends BaseExpression<Indexer>
{
    private readonly _entries: Array<PropertyExpression|SpreadExpression>;

    public get entries(): Array<PropertyExpression|SpreadExpression>
    {
        return this._entries;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Object;
    }

    public constructor(entries: Array<PropertyExpression|SpreadExpression>)
    {
        super();

        this._entries = entries;
    }

    public evaluate(): Indexer
    {
        const evaluation: Indexer = { };

        for (const entry of this.entries)
        {
            if (entry instanceof PropertyExpression)
            {
                evaluation[entry.key.evaluate() as string] = entry.evaluate();
            }
            else
            {
                Object.assign(evaluation, entry.evaluate());
            }
        }

        return this._cache = evaluation;
    }

    public toString(): string
    {
        return this.entries.length > 0 ? `{ ${this.entries.map(x => x.toString()).join(", ")} }` : "{ }";
    }
}
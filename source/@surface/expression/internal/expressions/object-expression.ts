import { Indexer, Nullable } from "@surface/core";
import { coalesce }          from "@surface/core/common/generic";
import ExpressionType        from "../../expression-type";
import IExpression           from "../../interfaces/expression";
import PropertyExpression    from "./property-expression";

export default class ObjectExpression implements IExpression
{
    private _cache: Nullable<Indexer>;
    public get cache(): Indexer
    {
        return coalesce(this._cache, () => this.evaluate());
    }

    private readonly _properties: Array<PropertyExpression>;
    public get properties(): Array<PropertyExpression>
    {
        return this._properties;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Object;
    }

    public constructor(properties: Array<PropertyExpression>)
    {
        this._properties = properties;
    }

    public evaluate(): Indexer
    {
        const $object: Indexer = { };

        for (const property of this.properties)
        {
            $object[property.key.evaluate() as string] = property.evaluate();
        }

        return this._cache = $object;
    }
}
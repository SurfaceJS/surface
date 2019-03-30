import { Indexer }        from "@surface/core";
import ExpressionType     from "../../expression-type";
import BaseExpression     from "./abstracts/base-expression";
import PropertyExpression from "./property-expression";

export default class ObjectExpression extends BaseExpression<Indexer>
{
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
        super();

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
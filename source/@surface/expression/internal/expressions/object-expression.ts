import { Nullable }       from "@surface/types";
import ExpressionType     from "../../expression-type";
import IExpression        from "../../interfaces/expression";
import PropertyExpression from "./property-expression";

export default class ObjectExpression implements IExpression
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
        this._properties = properties;
    }

    public evaluate(): Object
    {
        const $object: { [key: string]: Nullable<Object> } = { };

        for (const property of this.properties)
        {
            $object[property.key.evaluate() as string] = property.evaluate();
        }

        return $object;
    }
}
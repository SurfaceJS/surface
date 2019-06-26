import ExpressionType     from "../../expression-type";
import BaseExpression     from "./abstracts/base-expression";
import PropertyExpression from "./property-expression";

export default class ObjectDestructureExpression extends BaseExpression
{
    private _properties: Array<PropertyExpression>;
    public get properties(): Array<PropertyExpression>
    {
        return this._properties;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.ArrayDestructure;
    }

    public constructor(properties: Array<PropertyExpression>)
    {
        super();

        this._properties = properties;
    }

    public evaluate(): unknown
    {
        return this._cache = undefined;
    }

    public toString(): string
    {
        return `{ ${this.properties.map(x => x.toString()).join(", ")} }`;
    }
}
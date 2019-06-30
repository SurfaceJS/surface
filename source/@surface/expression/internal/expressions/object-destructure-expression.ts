import { Indexer }             from "@surface/core";
import { coalesce, typeGuard } from "@surface/core/common/generic";
import ExpressionType          from "../../expression-type";
import IDestructureExpression  from "../../interfaces/destructure-expression";
import TypeGuard               from "../type-guard";
import BaseExpression          from "./abstracts/base-expression";
import PropertyExpression      from "./property-expression";
import RestExpression          from "./rest-expression";

export default class ObjectDestructureExpression extends BaseExpression implements IDestructureExpression
{
    private _properties: Array<PropertyExpression|RestExpression>;
    public get properties(): Array<PropertyExpression|RestExpression>
    {
        return this._properties;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.ArrayDestructure;
    }

    public constructor(properties: Array<PropertyExpression|RestExpression>)
    {
        super();

        this._properties = properties;
    }

    public destruct(value: unknown): Indexer
    {
        const result: Indexer = { };

        if (!typeGuard<Indexer>(value, x => typeof x != "object" || x == null))
        {
            return result;
        }

        for (const property of this.properties)
        {
            if (TypeGuard.isPropertyExpression(property))
            {
                if (property.shorthand)
                {
                    if (TypeGuard.isAssignmentExpression(property.value))
                    {
                        result[`${property.value.left.evaluate()}`] = coalesce(value[`${property.value.left.evaluate()}`], property.value.right.evaluate());
                    }
                    else
                    {
                        result[`${property.value.evaluate()}`] = value[`${property.value.evaluate()}`];
                    }
                }
                else
                {
                    if (TypeGuard.isAssignmentExpression(property.value))
                    {
                        result[`${property.key.evaluate()}`] = coalesce(value[`${property.value.left.evaluate()}`], property.value.right.evaluate());
                    }
                    else
                    {
                        result[`${property.key.evaluate()}`] = value[`${property.value.evaluate()}`];
                    }
                }
            }
            else
            {
                Object.assign(result, property.destruct(value));
            }
        }

        return result;
    }

    public evaluate(): unknown
    {
        return undefined;
    }

    public toString(): string
    {
        return `{ ${this.properties.map(x => x.toString()).join(", ")} }`;
    }
}
import type { Indexer }   from "@surface/core";
import type Property      from "../elements/property.js";
import type SpreadElement from "../elements/spread-element.js";
import type IExpression   from "../interfaces/expression.js";
import NodeType           from "../node-type.js";
import TypeGuard          from "../type-guard.js";

export default class ObjectExpression implements IExpression
{
    private _properties: (Property | SpreadElement)[];
    public get properties(): (Property | SpreadElement)[]
    {
        return this._properties;
    }

    /* c8 ignore next 4 */
    public set properties(value: (Property | SpreadElement)[])
    {
        this._properties = value;
    }

    public get type(): NodeType
    {
        return NodeType.ObjectExpression;
    }

    public constructor(properties: (Property | SpreadElement)[] = [])
    {
        this._properties = properties;
    }

    public clone(): ObjectExpression
    {
        return new ObjectExpression(this.properties.map(x => x.clone()));
    }

    public evaluate(scope: object): Indexer
    {
        const evaluation: Indexer = { };

        for (const property of this.properties)
        {
            if (TypeGuard.isProperty(property))
            {
                const key = TypeGuard.isIdentifier(property.key) && !property.computed ? property.key.name : property.key.evaluate(scope) as string | number;

                evaluation[key] = property.value.evaluate(scope);
            }
            else
            {
                Object.assign(evaluation, property.argument.evaluate(scope));
            }
        }

        return evaluation;
    }

    public toString(): string
    {
        return this.properties.length > 0 ? `{ ${this.properties.map(x => x.toString()).join(", ")} }` : "{ }";
    }
}
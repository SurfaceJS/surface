import type { Indexer }       from "@surface/core";
import type IExpression       from "../interfaces/expression";
import type IObjectExpression from "../interfaces/object-expression";
import type IProperty         from "../interfaces/property";
import type ISpreadElement    from "../interfaces/spread-element";
import NodeType               from "../node-type.js";
import TypeGuard              from "../type-guard.js";

export default class ObjectExpression implements IExpression
{
    private _properties: (IProperty | ISpreadElement)[];
    public get properties(): (IProperty | ISpreadElement)[]
    {
        return this._properties;
    }

    /* c8 ignore next 4 */
    public set properties(value: (IProperty | ISpreadElement)[])
    {
        this._properties = value;
    }

    public get type(): NodeType
    {
        return NodeType.ObjectExpression;
    }

    public constructor(properties: (IProperty | ISpreadElement)[])
    {
        this._properties = properties;
    }

    public clone(): IObjectExpression
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
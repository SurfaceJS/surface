import { Indexer, hasValue } from "@surface/core";
import IExpression           from "../interfaces/expression";
import IObjectExpression     from "../interfaces/object-expression";
import IProperty             from "../interfaces/property";
import ISpreadElement        from "../interfaces/spread-element";
import NodeType              from "../node-type";
import TypeGuard             from "../type-guard";

export default class ObjectExpression implements IExpression
{
    private cache: Indexer | null = null;

    private _properties: (IProperty | ISpreadElement)[];
    public get properties(): (IProperty | ISpreadElement)[]
    {
        return this._properties;
    }

    /* istanbul ignore next */
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

    public evaluate(scope: object, useCache?: boolean): Indexer
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        const evaluation: Indexer = { };

        for (const property of this.properties)
        {
            if (TypeGuard.isProperty(property))
            {
                const key = TypeGuard.isIdentifier(property.key) && !property.computed ? property.key.name : property.key.evaluate(scope, useCache) as string | number;

                evaluation[key] = property.value.evaluate(scope, useCache);
            }
            else
            {
                Object.assign(evaluation, property.argument.evaluate(scope, useCache));
            }
        }

        return this.cache = evaluation;
    }

    public toString(): string
    {
        return this.properties.length > 0 ? `{ ${this.properties.map(x => x.toString()).join(", ")} }` : "{ }";
    }
}
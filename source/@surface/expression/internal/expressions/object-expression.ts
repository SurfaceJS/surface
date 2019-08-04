import { Indexer, Nullable } from "@surface/core";
import { hasValue }          from "@surface/core/common/generic";
import IExpression           from "../../interfaces/expression";
import IProperty             from "../../interfaces/property";
import ISpreadElement        from "../../interfaces/spread-element";
import NodeType              from "../../node-type";
import TypeGuard             from "../type-guard";

export default class ObjectExpression implements IExpression
{
    private cache: Nullable<Indexer>;

    private _properties: Array<IProperty|ISpreadElement>;
    public get properties(): Array<IProperty|ISpreadElement>
    {
        return this._properties;
    }

    /* istanbul ignore next */
    public set properties(value: Array<IProperty|ISpreadElement>)
    {
        this._properties = value;
    }

    public get type(): NodeType
    {
        return NodeType.ObjectExpression;
    }

    public constructor(properties: Array<IProperty|ISpreadElement>)
    {
        this._properties = properties;
    }

    public evaluate(scope: Indexer, useCache: boolean): Indexer
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
                const key = TypeGuard.isIdentifier(property.key) && !property.computed ? property.key.name : property.key.evaluate(scope, useCache) as string|number;

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
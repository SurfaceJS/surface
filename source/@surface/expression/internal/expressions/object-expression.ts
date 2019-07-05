import { Indexer }    from "@surface/core";
import IProperty      from "../../interfaces/property";
import ISpreadElement from "../../interfaces/spread-element";
import NodeType       from "../../node-type";
import TypeGuard      from "../type-guard";
import BaseExpression from "./abstracts/base-expression";

export default class ObjectExpression extends BaseExpression<Indexer>
{
    private _properties: Array<IProperty|ISpreadElement>;
    public get properties(): Array<IProperty|ISpreadElement>
    {
        return this._properties;
    }

    public set properties(value: Array<IProperty|ISpreadElement>)
    {
        this._properties = value;
    }

    public get type(): NodeType
    {
        return NodeType.Object;
    }

    public constructor(properties: Array<IProperty|ISpreadElement>)
    {
        super();

        this._properties = properties;
    }

    public evaluate(): Indexer
    {
        const evaluation: Indexer = { };

        for (const property of this.properties)
        {
            if (TypeGuard.isProperty(property))
            {
                evaluation[property.key.evaluate() as string] = property.value.evaluate();
            }
            else
            {
                Object.assign(evaluation, property.argument.evaluate());
            }
        }

        return this._cache = evaluation;
    }

    public toString(): string
    {
        return this.properties.length > 0 ? `{ ${this.properties.map(x => x.toString()).join(", ")} }` : "{ }";
    }
}
import { Indexer, Nullable }  from "@surface/core";
import { hasValue } from "@surface/core/common/generic";
import IExpression  from "../../interfaces/expression";
import NodeType     from "../../node-type";
import TypeGuard    from "../type-guard";

export default class MemberExpression implements IExpression
{
    private cache: unknown;

    private _computed: boolean;
    public get computed(): boolean
    {
        return this._computed;
    }

    public set computed(value: boolean)
    {
        this._computed = value;
    }

    private _property: IExpression;
    public get property(): IExpression
    {
        return this._property;
    }

    public set property(value: IExpression)
    {
        this._property = value;
    }

    private _object: IExpression;
    public get object(): IExpression
    {
        return this._object;
    }

    public set object(value: IExpression)
    {
        this._object = value;
    }

    private _optional: boolean;
    public get optional(): boolean
    {
        return this._optional;
    }

    public set optional(value: boolean)
    {
        this._optional = value;
    }

    public get type(): NodeType
    {
        return NodeType.MemberExpression;
    }

    public constructor(object: IExpression, property: IExpression, computed: boolean, optional?: boolean)
    {
        this._object   = object;
        this._property = property;
        this._computed = computed;
        this._optional = !!optional;
    }

    public evaluate(scope: Indexer, useChache: boolean): unknown
    {
        if (useChache && hasValue(this.cache))
        {
            return this.cache;
        }

        const object = this.object.evaluate(scope, useChache) as Nullable<Indexer>;

        if (this.optional)
        {
            return this.cache = (hasValue(object) ? object[`${this.property.evaluate(scope, useChache)}`] : undefined);
        }

        return this.cache = object![`${this.property.evaluate(scope, useChache)}`];
    }

    public toString(): string
    {
        return `${this.object}${TypeGuard.isIdentifier(this.property) ? `${this.optional ? "?" : ""}.${this.property.name}` : `${this.optional ? "?." : ""}[${this.property}]`}`;
    }
}
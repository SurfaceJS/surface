import { Indexer, Nullable } from "@surface/core";
import { hasValue }          from "@surface/core/common/generic";
import IExpression           from "../../interfaces/expression";
import IMemberExpression     from "../../interfaces/member-expression";
import NodeType              from "../../node-type";
import TypeGuard             from "../type-guard";

export default class MemberExpression implements IExpression
{
    private cache: unknown;

    private _computed: boolean;
    public get computed(): boolean
    {
        return this._computed;
    }

    /* istanbul ignore next */
    public set computed(value: boolean)
    {
        this._computed = value;
    }

    private _property: IExpression;
    public get property(): IExpression
    {
        return this._property;
    }

    /* istanbul ignore next */
    public set property(value: IExpression)
    {
        this._property = value;
    }

    private _object: IExpression;
    public get object(): IExpression
    {
        return this._object;
    }

    /* istanbul ignore next */
    public set object(value: IExpression)
    {
        this._object = value;
    }

    private _optional: boolean;
    public get optional(): boolean
    {
        return this._optional;
    }

    /* istanbul ignore next */
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

    public clone(): IMemberExpression
    {
        return new MemberExpression(this.object.clone(), this.property.clone(), this.computed, this.optional);
    }

    public evaluate(scope: Indexer, useCache?: boolean): unknown
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        const object = this.object.evaluate(scope, useCache) as Nullable<Indexer>;

        const key = TypeGuard.isIdentifier(this.property) && !this.computed ?  this.property.name : `${this.property.evaluate(scope, useCache)}`;

        if (this.optional)
        {
            return this.cache = (hasValue(object) ? object[key] : undefined);
        }

        return this.cache = object![key];
    }

    public toString(): string
    {
        return `${this.object}${TypeGuard.isIdentifier(this.property) && !this.computed ? `${this.optional ? "?" : ""}.${this.property.name}` : `${this.optional ? "?." : ""}[${this.property}]`}`;
    }
}
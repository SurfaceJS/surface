import { Indexer }  from "@surface/core";
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

    public get type(): NodeType
    {
        return NodeType.MemberExpression;
    }

    public constructor(object: IExpression, property: IExpression, computed: boolean)
    {
        this._object   = object;
        this._property = property;
        this._computed = computed;
    }

    public evaluate(scope: Indexer, useChache: boolean): unknown
    {
        if (useChache && hasValue(this.cache))
        {
            return this.cache;
        }

        return this.cache = (this.object.evaluate(scope, useChache) as Indexer)[`${this.property.evaluate(scope, useChache)}`];
    }

    public toString(): string
    {
        return `${this.object}${TypeGuard.isIdentifier(this.property) ? `.${this.property.name}` : `[${this.property}]`}`;
    }
}
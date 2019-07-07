import { Indexer }    from "@surface/core";
import IExpression    from "../../interfaces/expression";
import NodeType       from "../../node-type";
import TypeGuard      from "../type-guard";
import BaseExpression from "./abstracts/base-expression";

export default class MemberExpression extends BaseExpression
{
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
        super();

        this._object   = object;
        this._property = property;
        this._computed = computed;
    }

    public evaluate(): unknown
    {
        return this._cache = (this.object.evaluate() as Indexer)[`${this.property.evaluate()}`];
    }

    public toString(): string
    {
        return `${this.object}${TypeGuard.isIdentifier(this.property) ? `.${this.property.name}` : `[${this.property}]`}`;
    }
}
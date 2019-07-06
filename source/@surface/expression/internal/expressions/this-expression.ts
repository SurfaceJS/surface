import NodeType       from "../../node-type";
import { ThisValue }  from "../../types";
import BaseExpression from "./abstracts/base-expression";

export default class ThisExpression extends BaseExpression
{
    private _scope: ThisValue;
    public get scope(): ThisValue
    {
        return this._scope;
    }

    public set scope(value: ThisValue)
    {
        this._scope = value;
    }

    public get type(): NodeType
    {
        return NodeType.ThisExpression;
    }

    public constructor(scope: ThisValue)
    {
        super();

        this._scope = scope;
    }

    public evaluate(): unknown
    {
        return this._cache = this.scope.this;
    }

    public toString(): string
    {
        return "this";
    }
}
import { Indexer }    from "@surface/core";
import IPattern       from "../../interfaces/pattern";
import NodeType       from "../../node-type";
import BaseExpression from "./abstracts/base-expression";

export default class Identifier extends BaseExpression implements IPattern
{
    private _name: string;
    public get name(): string
    {
        return this._name;
    }

    public set name(value: string)
    {
        this._name = value;
    }

    private readonly _scope: Indexer;
    public get scope(): Indexer
    {
        return this._scope;
    }

    public get type(): NodeType
    {
        return NodeType.Identifier;
    }

    public constructor(scope: Indexer, name: string)
    {
        super();

        this._scope = scope;
        this._name  = name;
    }

    public evaluate(): unknown
    {
        return this._cache = this.scope[this.name];
    }

    public toString(): string
    {
        return this.name;
    }
}
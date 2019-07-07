import { Indexer }    from "@surface/core";
import IPattern       from "../../interfaces/pattern";
import NodeType       from "../../node-type";
import BaseExpression from "./abstracts/base-expression";

export default class Identifier extends BaseExpression implements IPattern
{
    private readonly _binded: boolean;
    public get binded(): boolean
    {
        return this._binded;
    }

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

    public constructor(name: string, binded?: boolean, scope?: Indexer)
    {
        super();

        this._name   = name;
        this._binded = !!binded;
        this._scope  = scope || { };
    }

    public evaluate(): unknown
    {
        return this._cache = this.binded ? this.scope[this.name] : this.name;
    }

    public toString(): string
    {
        return this.name;
    }
}
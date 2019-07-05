import { Indexer }    from "@surface/core";
import NodeType from "../../node-type";
import BaseExpression from "./abstracts/base-expression";

export default class IdentifierExpression extends BaseExpression
{
    private readonly _context: Indexer;
    public get context(): Indexer
    {
        return this._context;
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

    public get type(): NodeType
    {
        return NodeType.Identifier;
    }

    public constructor(context: Indexer, name: string)
    {
        super();

        this._context = context;
        this._name    = name;
    }

    public evaluate(): unknown
    {
        return this._cache = this.context[this.name];
    }

    public toString(): string
    {
        return this.name;
    }
}
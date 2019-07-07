import { Indexer }  from "@surface/core";
import { hasValue } from "@surface/core/common/generic";
import IExpression  from "../../interfaces/expression";
import IPattern     from "../../interfaces/pattern";
import NodeType     from "../../node-type";

export default class Identifier implements IExpression, IPattern
{
    private cache: unknown;

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

    public get type(): NodeType
    {
        return NodeType.Identifier;
    }

    public constructor(name: string, binded?: boolean)
    {
        this._name   = name;
        this._binded = !!binded;
    }

    public evaluate(scope: Indexer, useChache: boolean): unknown
    {
        if (useChache && hasValue(this.cache))
        {
            return this.cache;
        }

        return this.cache = this.binded ? scope[this.name] : this.name;
    }

    public toString(): string
    {
        return this.name;
    }
}
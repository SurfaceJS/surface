import { Indexer }  from "@surface/core";
import { hasValue } from "@surface/core/common/generic";
import { format }   from "@surface/core/common/string";
import IExpression  from "../../interfaces/expression";
import IPattern     from "../../interfaces/pattern";
import NodeType     from "../../node-type";
import { PATTERN }  from "../../symbols";
import Messages     from "../messages";

export default class Identifier implements IExpression, IPattern
{
    private cache: unknown;
    private _name: string;

    public [PATTERN]: void;

    public get name(): string
    {
        return this._name;
    }

    /* istanbul ignore next */
    public set name(value: string)
    {
        this._name = value;
    }

    public get type(): NodeType
    {
        return NodeType.Identifier;
    }

    public constructor(name: string)
    {
        this._name = name;
    }

    public evaluate(scope: Indexer, useCache?: boolean): unknown
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        if (this.name == "undefined")
        {
            return undefined;
        }

        if (!(this.name in scope))
        {
            throw new ReferenceError(format(Messages.identifierIsNotDefined, { identifier: this.name }));
        }

        return this.cache = scope[this.name];
    }

    public toString(): string
    {
        return this.name;
    }
}
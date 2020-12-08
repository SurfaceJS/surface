import type { Indexer }     from "@surface/core";
import { format, hasValue } from "@surface/core";
import type IExpression     from "../interfaces/expression";
import type IIdentifier     from "../interfaces/identifier";
import type IPattern        from "../interfaces/pattern";
import Messages             from "../messages.js";
import NodeType             from "../node-type.js";
import { PATTERN }          from "../symbols.js";

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

    public clone(): IIdentifier
    {
        return new Identifier(this.name);
    }

    public evaluate(scope: object, useCache?: boolean): unknown
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

        return this.cache = (scope as Indexer)[this.name];
    }

    public toString(): string
    {
        return this.name;
    }
}
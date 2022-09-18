import type { Indexer } from "@surface/core";
import { format }       from "@surface/core";
import type IExpression from "../interfaces/expression.js";
import type IPattern    from "../interfaces/pattern.js";
import Messages         from "../messages.js";
import NodeType         from "../node-type.js";
import { PATTERN }      from "../symbols.js";

export default class Identifier implements IExpression, IPattern
{
    private _name: string;

    public [PATTERN]: void = undefined;

    public get name(): string
    {
        return this._name;
    }

    /* c8 ignore next 4 */
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

    public clone(): Identifier
    {
        return new Identifier(this.name);
    }

    public evaluate(scope: object): unknown;
    public evaluate(scope: object, value: unknown): object;
    public evaluate(scope: object, value?: unknown): unknown
    {
        if (arguments.length == 2)
        {
            return { [this.name]: value };
        }

        if (this.name == "undefined")
        {
            return undefined;
        }

        if (!(this.name in scope))
        {
            throw new ReferenceError(format(Messages.identifierIsNotDefined, { identifier: this.name }));
        }

        return (scope as Indexer)[this.name];
    }

    public toString(): string
    {
        return this.name;
    }
}
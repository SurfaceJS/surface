import type IPattern           from "../interfaces/pattern";
import type IRestElement       from "../interfaces/rest-element";
import NodeType                from "../node-type.js";
import { PATTERN }             from "../symbols.js";
import TypeGuard from "../type-guard.js";

export default class RestElement implements IPattern
{
    private _argument: IPattern;

    public [PATTERN]: void;

    public get argument(): IPattern
    {
        return this._argument;
    }

    /* c8 ignore next 4 */
    public set argument(value: IPattern)
    {
        this._argument = value;
    }

    public get type(): NodeType
    {
        return NodeType.RestElement;
    }

    public constructor(argument: IPattern)
    {
        this._argument = argument;
    }

    public clone(): IRestElement
    {
        return new RestElement(this.argument.clone());
    }

    public evaluate(scope: object, value: unknown): object
    {
        if (TypeGuard.isIdentifier(this.argument))
        {
            return { [this.argument.name]: value };
        }

        return this.argument.evaluate(scope, value);
    }

    public toString(): string
    {
        return `...${this.argument}`;
    }
}
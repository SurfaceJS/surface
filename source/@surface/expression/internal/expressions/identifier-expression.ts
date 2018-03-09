import IExpression from "../../interfaces/expression";

import { Nullable } from "@surface/types";

export default class IdentifierExpression implements IExpression
{
    private readonly _context: Object;
    public get context(): Object
    {
        return this._context;
    }

    private _name: string;
    public get name(): string
    {
        return this._name;
    }

    public constructor(context: Object, name: string)
    {
        if (!(name in context))
        {
            throw new Error(`The identifier ${name} does not exist in this context`);
        }

        this._context = context;
        this._name    = name;
    }

    public evaluate(): Nullable<Object>
    {
        return this.context[this.name];
    }
}
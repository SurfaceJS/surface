import IExpression    from "../../interfaces/expression";
import ExpressionType from "../../expression-type";

import { Nullable } from "@surface/types";

export default class CallExpression implements IExpression
{
    private readonly _context: IExpression;
    public get context(): IExpression
    {
        return this._context;
    }

    private readonly _name: string;
    public get name(): string
    {
        return this._name;
    }

    private readonly _args: Array<IExpression>;
    public get args(): Array<IExpression>
    {
        return this._args;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Call;
    }

    public constructor(context: IExpression, name: string, args: Array<IExpression>)
    {
        this._args    = args;
        this._context = context;
        this._name    = name;
    }

    public evaluate(): Nullable<Object>
    {
        const context = this.context.evaluate() as Object;
        return context[this.name].apply(context, this.args.map(x => x.evaluate()));
    }
}
import { Indexer, Nullable } from "@surface/core";
import { coalesce }          from "@surface/core/common/generic";
import ExpressionType        from "../../expression-type";
import IExpression           from "../../interfaces/expression";

export default class CallExpression implements IExpression
{
    private _cache: Nullable<unknown>;
    public get cache(): unknown
    {
        return coalesce(this._cache, () => this.evaluate());
    }

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

    public evaluate(): unknown
    {
        const context = this.context.evaluate() as Indexer<Function>;
        const fn      = context[this.name];

        if (!fn)
        {
            throw new ReferenceError(`${this.name} is not defined`);
        }
        else if (typeof fn != "function")
        {
            throw new TypeError(`${this.name} is not a function`);
        }

        return this._cache = fn.apply(context, this.args.map(x => x.evaluate()));
    }
}
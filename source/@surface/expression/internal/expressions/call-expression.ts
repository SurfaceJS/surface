import { Indexer, Nullable } from "@surface/core";
import ExpressionType        from "../../expression-type";
import IExpression           from "../../interfaces/expression";
import TypeGuard             from "../type-guard";
import BaseExpression        from "./abstracts/base-expression";
import SpreadExpression      from "./spread-expression";

export default class CallExpression extends BaseExpression
{
    private readonly _context: IExpression;
    public get context(): IExpression
    {
        return this._context;
    }

    private readonly _callee: IExpression;
    public get callee(): IExpression
    {
        return this._callee;
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

    public constructor(context: IExpression, callee: IExpression, args: Array<IExpression>)
    {
        super();

        this._args    = args;
        this._context = context;
        this._callee    = callee;
    }

    public evaluate(): unknown
    {
        let context = this.context.evaluate() as Indexer<Function>;
        let fn      = TypeGuard.isIdentifierExpression(this.callee) ?
            context[this.callee.name] as Nullable<Function>
            : TypeGuard.isMemberExpression(this.callee) ?
                context[this.callee.key.evaluate() as string|number] as Nullable<Function>
                : this.callee.evaluate()  as Nullable<Function>;

        if (!fn)
        {
            throw new ReferenceError(`${this.callee.toString()} is not defined`);
        }
        else if (typeof fn != "function")
        {
            throw new TypeError(`${this.callee.toString()} is not a function`);
        }

        const $arguments: Array<unknown> = [];

        for (const argument of this.args)
        {
            if (argument instanceof SpreadExpression)
            {
                $arguments.push(...argument.evaluate() as Array<unknown>);
            }
            else
            {
                $arguments.push(argument.evaluate());
            }
        }

        return this._cache = fn.apply(context, $arguments);
    }

    public toString(): string
    {
        return `${[ExpressionType.Conditional, ExpressionType.Binary].includes(this.callee.type) ? `(${this.callee})` : this.callee}(${this.args.map(x => x.toString()).join(", ")})`;
    }
}
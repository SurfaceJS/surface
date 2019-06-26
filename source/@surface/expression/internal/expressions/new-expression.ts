import ExpressionType   from "../../expression-type";
import IExpression      from "../../interfaces/expression";
import BaseExpression   from "./abstracts/base-expression";
import SpreadExpression from "./spread-expression";

export default class NewExpression extends BaseExpression
{
    private readonly _args: Array<IExpression>;
    public get args(): Array<IExpression>
    {
        return this._args;
    }

    private readonly _callee: IExpression;
    public get callee(): IExpression
    {
        return this._callee;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.New;
    }

    public constructor(callee: IExpression, args: Array<IExpression>)
    {
        super();

        this._callee = callee;
        this._args   = args;
    }

    public evaluate(): unknown
    {
        const fn = this.callee.evaluate() as Function;

        if (!fn)
        {
            throw new ReferenceError(`${this.callee.toString()} is not defined`);
        }
        else if (typeof fn != "function")
        {
            throw new TypeError(`${this.callee.toString()} is not a constructor`);
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

        return this._cache = Reflect.construct(fn, $arguments, fn);
    }

    public toString(): string
    {
        return `new ${this.callee}(${this.args.map(x => x.toString()).join(", ")})`;
    }
}
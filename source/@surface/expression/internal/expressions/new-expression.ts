import IExpression    from "../../interfaces/expression";
import ISpreadElement from "../../interfaces/spread-element";
import NodeType       from "../../node-type";
import TypeGuard      from "../type-guard";
import BaseExpression from "./abstracts/base-expression";

export default class NewExpression extends BaseExpression
{
    private readonly _args: Array<IExpression|ISpreadElement>;
    public get args(): Array<IExpression|ISpreadElement>
    {
        return this._args;
    }

    private readonly _callee: IExpression;
    public get callee(): IExpression
    {
        return this._callee;
    }

    public get type(): NodeType
    {
        return NodeType.New;
    }

    public constructor(callee: IExpression, args: Array<IExpression|ISpreadElement>)
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
            if (TypeGuard.isSpreadElement(argument))
            {
                $arguments.push(...argument.argument.evaluate() as Array<unknown>);
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
import IExpression    from "../../interfaces/expression";
import ISpreadElement from "../../interfaces/spread-element";
import NodeType       from "../../node-type";
import TypeGuard      from "../type-guard";
import BaseExpression from "./abstracts/base-expression";

export default class NewExpression extends BaseExpression
{
    private _arguments: Array<IExpression|ISpreadElement>;
    public get arguments(): Array<IExpression|ISpreadElement>
    {
        return this._arguments;
    }

    public set arguments(value: Array<IExpression|ISpreadElement>)
    {
        this._arguments = value;
    }

    private _callee: IExpression;
    public get callee(): IExpression
    {
        return this._callee;
    }

    public set callee(value: IExpression)
    {
        this._callee = value;
    }

    public get type(): NodeType
    {
        return NodeType.NewExpression;
    }

    public constructor(callee: IExpression, $arguments: Array<IExpression|ISpreadElement>)
    {
        super();

        this._callee    = callee;
        this._arguments = $arguments;
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

        for (const argument of this.arguments)
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
        return `new ${this.callee}(${this.arguments.map(x => x.toString()).join(", ")})`;
    }
}
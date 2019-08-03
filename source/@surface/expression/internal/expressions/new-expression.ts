import { Indexer }    from "@surface/core";
import { hasValue }   from "@surface/core/common/generic";
import IExpression    from "../../interfaces/expression";
import ISpreadElement from "../../interfaces/spread-element";
import NodeType       from "../../node-type";
import TypeGuard      from "../type-guard";

export default class NewExpression implements IExpression
{
    private cache: unknown;

    private _arguments: Array<IExpression|ISpreadElement>;
    public get arguments(): Array<IExpression|ISpreadElement>
    {
        return this._arguments;
    }

    /* istanbul ignore next */
    public set arguments(value: Array<IExpression|ISpreadElement>)
    {
        this._arguments = value;
    }

    private _callee: IExpression;
    public get callee(): IExpression
    {
        return this._callee;
    }

    /* istanbul ignore next */
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
        this._callee    = callee;
        this._arguments = $arguments;
    }

    public evaluate(scope: Indexer, useChache: boolean): unknown
    {
        if (useChache && hasValue(this.cache))
        {
            return this.cache;
        }

        const fn = this.callee.evaluate(scope, useChache) as Function;

        if (!fn)
        {
            throw new ReferenceError(`${this.callee} is not defined`);
        }
        else if (typeof fn != "function")
        {
            throw new TypeError(`${this.callee} is not a constructor`);
        }

        const $arguments: Array<unknown> = [];

        for (const argument of this.arguments)
        {
            if (TypeGuard.isSpreadElement(argument))
            {
                $arguments.push(...argument.argument.evaluate(scope, useChache) as Array<unknown>);
            }
            else
            {
                $arguments.push(argument.evaluate(scope, useChache));
            }
        }

        return this.cache = Reflect.construct(fn, $arguments, fn);
    }

    public toString(): string
    {
        return `new ${this.callee}(${this.arguments.map(x => x.toString()).join(", ")})`;
    }
}
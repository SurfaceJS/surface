import { Indexer, Nullable } from "@surface/core";
import { hasValue }          from "@surface/core/common/generic";
import IExpression           from "../../interfaces/expression";
import ISpreadElement        from "../../interfaces/spread-element";
import NodeType              from "../../node-type";
import TypeGuard             from "../type-guard";

export default class CallExpression implements IExpression
{
    private cache: unknown;

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

    private _thisArg: IExpression;
    public get thisArg(): IExpression
    {
        return this._thisArg;
    }

    public set thisArg(value: IExpression)
    {
        this._thisArg = value;
    }

    public get type(): NodeType
    {
        return NodeType.CallExpression;
    }

    public constructor(thisArg: IExpression, callee: IExpression, $arguments: Array<IExpression|ISpreadElement>)
    {
        this._arguments = $arguments;
        this._thisArg   = thisArg;
        this._callee    = callee;
    }

    public evaluate(scope: Indexer, useChache: boolean): unknown
    {
        if (useChache && hasValue(this.cache))
        {
            return this.cache;
        }

        const fn = this.callee.evaluate(scope, useChache) as Nullable<Function>;

        if (!fn)
        {
            throw new ReferenceError(`${this.callee} is not defined`);
        }
        else if (typeof fn != "function")
        {
            throw new TypeError(`${this.callee} is not a function`);
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

        return this.cache = fn.apply(this.thisArg.evaluate(scope, (TypeGuard.isMemberExpression(this.callee) && this.callee.object == this.thisArg) || useChache), $arguments);
    }

    public toString(): string
    {
        return `${[NodeType.BinaryExpression, NodeType.ConditionalExpression, NodeType.ArrowFunctionExpression].includes(this.callee.type) ? `(${this.callee})` : this.callee}(${this.arguments.map(x => x.toString()).join(", ")})`;
    }
}
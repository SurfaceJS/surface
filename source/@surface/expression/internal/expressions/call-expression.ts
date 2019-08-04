import { Indexer, Nullable } from "@surface/core";
import { hasValue }          from "@surface/core/common/generic";
import { format }            from "@surface/core/common/string";
import IExpression           from "../../interfaces/expression";
import ISpreadElement        from "../../interfaces/spread-element";
import NodeType              from "../../node-type";
import Messages              from "../messages";
import TypeGuard             from "../type-guard";

export default class CallExpression implements IExpression
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

    private _optional: boolean;
    public get optional(): boolean
    {
        return this._optional;
    }

    /* istanbul ignore next */
    public set optional(value: boolean)
    {
        this._optional = value;
    }

    private _thisArg: IExpression;
    public get thisArg(): IExpression
    {
        return this._thisArg;
    }

    /* istanbul ignore next */
    public set thisArg(value: IExpression)
    {
        this._thisArg = value;
    }

    public get type(): NodeType
    {
        return NodeType.CallExpression;
    }

    public constructor(thisArg: IExpression, callee: IExpression, $arguments: Array<IExpression|ISpreadElement>, optional?: boolean)
    {
        this._arguments = $arguments;
        this._thisArg   = thisArg;
        this._callee    = callee;
        this._optional  = !!optional;
    }

    public evaluate(scope: Indexer, useCache: boolean): unknown
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        const fn = this.callee.evaluate(scope, useCache) as Nullable<Function>;

        if (this.optional && !hasValue(fn))
        {
            return undefined;
        }

        if (!fn)
        {
            throw new ReferenceError(format(Messages.identifierIsNotDefined, { identifier: this.callee.toString() }));
        }
        else if (typeof fn != "function")
        {
            throw new TypeError(format(Messages.identifierIsNotAFunction, { identifier: this.callee.toString() }));
        }

        const $arguments: Array<unknown> = [];

        for (const argument of this.arguments)
        {
            if (TypeGuard.isSpreadElement(argument))
            {
                $arguments.push(...argument.argument.evaluate(scope, useCache) as Array<unknown>);
            }
            else
            {
                $arguments.push(argument.evaluate(scope, useCache));
            }
        }

        return this.cache = fn.apply(this.thisArg.evaluate(scope, true), $arguments);
    }

    public toString(): string
    {
        return `${[NodeType.BinaryExpression, NodeType.ConditionalExpression, NodeType.ArrowFunctionExpression].includes(this.callee.type) ? `(${this.callee})` : this.callee}${this.optional ? "?." : ""}(${this.arguments.map(x => x.toString()).join(", ")})`;
    }
}
import { format, hasValue } from "@surface/core";
import type ICallExpression from "../interfaces/call-expression";
import type IChainElement   from "../interfaces/chain-element.js";
import type IExpression     from "../interfaces/expression";
import type ISpreadElement  from "../interfaces/spread-element";
import Messages             from "../messages.js";
import NodeType             from "../node-type.js";
import TypeGuard            from "../type-guard.js";

export default class CallExpression implements IExpression, IChainElement
{
    private _arguments: (IExpression | ISpreadElement)[];
    public get arguments(): (IExpression | ISpreadElement)[]
    {
        return this._arguments;
    }

    /* c8 ignore next 4 */
    public set arguments(value: (IExpression | ISpreadElement)[])
    {
        this._arguments = value;
    }

    private _callee: IExpression;
    public get callee(): IExpression
    {
        return this._callee;
    }

    /* c8 ignore next 4 */
    public set callee(value: IExpression)
    {
        this._callee = value;
    }

    private _optional: boolean;
    public get optional(): boolean
    {
        return this._optional;
    }

    /* c8 ignore next 4 */
    public set optional(value: boolean)
    {
        this._optional = value;
    }

    public get type(): NodeType
    {
        return NodeType.CallExpression;
    }

    public constructor(callee: IExpression, $arguments: (IExpression | ISpreadElement)[], optional?: boolean)
    {
        this._arguments = $arguments;
        this._callee    = callee;
        this._optional  = !!optional;
    }

    public clone(): ICallExpression
    {
        return new CallExpression(this.callee.clone(), this.arguments.map(x => x.clone()), this.optional);
    }

    public evaluate(scope: object): unknown
    {
        const fn = this.callee.evaluate(scope);

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

        const $arguments: unknown[] = [];

        for (const argument of this.arguments)
        {
            if (TypeGuard.isSpreadElement(argument))
            {
                $arguments.push(...argument.argument.evaluate(scope) as unknown[]);
            }
            else
            {
                $arguments.push(argument.evaluate(scope));
            }
        }

        return fn(...$arguments);
    }

    public toString(): string
    {
        // eslint-disable-next-line max-len
        return `${[NodeType.BinaryExpression, NodeType.ConditionalExpression, NodeType.ArrowFunctionExpression].includes(this.callee.type) ? `(${this.callee})` : this.callee}${this.optional ? "?." : ""}(${this.arguments.map(x => x.toString()).join(", ")})`;
    }
}
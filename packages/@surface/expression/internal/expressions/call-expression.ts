import { format, hasValue } from "@surface/core";
import { getThisArg }       from "../common.js";
import type SpreadElement   from "../elements/spread-element.js";
import type IChainElement   from "../interfaces/chain-element.js";
import type IExpression     from "../interfaces/expression.js";
import Messages             from "../messages.js";
import NodeType             from "../node-type.js";
import TypeGuard            from "../type-guard.js";

export default class CallExpression implements IExpression, IChainElement
{
    private _arguments: (IExpression | SpreadElement)[];
    public get arguments(): (IExpression | SpreadElement)[]
    {
        return this._arguments;
    }

    /* c8 ignore next 4 */
    public set arguments(value: (IExpression | SpreadElement)[])
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

    public constructor(callee: IExpression, $arguments: (IExpression | SpreadElement)[] = [], optional: boolean = false)
    {
        this._arguments = $arguments;
        this._callee    = callee;
        this._optional  = optional;
    }

    public clone(): CallExpression
    {
        return new CallExpression(this.callee.clone(), this.arguments.map(x => x.clone()), this.optional);
    }

    public evaluate(scope: object): unknown
    {
        const [thisArg, fn] = getThisArg(this.callee, scope);

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

        return fn.apply(thisArg, $arguments);
    }

    public toString(): string
    {
        // eslint-disable-next-line max-len
        return `${[NodeType.BinaryExpression, NodeType.ConditionalExpression, NodeType.ArrowFunctionExpression].includes(this.callee.type) ? `(${this.callee})` : this.callee}${this.optional ? "?." : ""}(${this.arguments.map(x => x.toString()).join(", ")})`;
    }
}
import { format, hasValue } from "@surface/core";
import type IExpression     from "../interfaces/expression";
import type INewExpression  from "../interfaces/new-expression";
import type ISpreadElement  from "../interfaces/spread-element";
import Messages             from "../messages.js";
import NodeType             from "../node-type.js";
import TypeGuard            from "../type-guard.js";

export default class NewExpression implements IExpression
{
    private cache: unknown;

    private _arguments: (IExpression | ISpreadElement)[];
    public get arguments(): (IExpression | ISpreadElement)[]
    {
        return this._arguments;
    }

    /* istanbul ignore next */
    public set arguments(value: (IExpression | ISpreadElement)[])
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

    public constructor(callee: IExpression, $arguments: (IExpression | ISpreadElement)[])
    {
        this._callee    = callee;
        this._arguments = $arguments;
    }

    public clone(): INewExpression
    {
        return new NewExpression(this.callee.clone(), this.arguments.map(x => x.clone()));
    }

    public evaluate(scope: object, useCache?: boolean): unknown
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        const fn = this.callee.evaluate(scope, useCache) as Function;

        if (!fn)
        {
            throw new ReferenceError(format(Messages.identifierIsNotDefined, { identifier: this.callee.toString() }));
        }
        else if (typeof fn != "function")
        {
            throw new TypeError(format(Messages.identifierIsNotAConstructor, { identifier: this.callee.toString() }));
        }

        const $arguments: unknown[] = [];

        for (const argument of this.arguments)
        {
            if (TypeGuard.isSpreadElement(argument))
            {
                $arguments.push(...argument.argument.evaluate(scope, useCache) as unknown[]);
            }
            else
            {
                $arguments.push(argument.evaluate(scope, useCache));
            }
        }

        return this.cache = Reflect.construct(fn, $arguments, fn);
    }

    public toString(): string
    {
        return `new ${this.callee}(${this.arguments.map(x => x.toString()).join(", ")})`;
    }
}
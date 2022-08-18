import { format }         from "@surface/core";
import type SpreadElement from "../elements/spread-element";
import type IExpression   from "../interfaces/expression";
import Messages           from "../messages.js";
import NodeType           from "../node-type.js";
import TypeGuard          from "../type-guard.js";

export default class NewExpression implements IExpression
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

    public get type(): NodeType
    {
        return NodeType.NewExpression;
    }

    public constructor(callee: IExpression, $arguments: (IExpression | SpreadElement)[] = [])
    {
        this._callee    = callee;
        this._arguments = $arguments;
    }

    public clone(): NewExpression
    {
        return new NewExpression(this.callee.clone(), this.arguments.map(x => x.clone()));
    }

    public evaluate(scope: object): unknown
    {
        const fn = this.callee.evaluate(scope) as Function;

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
                $arguments.push(...argument.argument.evaluate(scope) as unknown[]);
            }
            else
            {
                $arguments.push(argument.evaluate(scope));
            }
        }

        return Reflect.construct(fn, $arguments, fn);
    }

    public toString(): string
    {
        return `new ${this.callee}(${this.arguments.map(x => x.toString()).join(", ")})`;
    }
}
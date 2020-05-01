import { Indexer }    from "@surface/core";
import { hasValue }   from "@surface/core/common/generic";
import { format }     from "@surface/core/common/string";
import IExpression    from "../../interfaces/expression";
import INewExpression from "../../interfaces/new-expression";
import ISpreadElement from "../../interfaces/spread-element";
import NodeType       from "../../node-type";
import Messages       from "../messages";
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

    public clone(): INewExpression
    {
        return new NewExpression(this.callee.clone(), this.arguments.map(x => x.clone()));
    }

    public evaluate(scope: Indexer, useCache?: boolean): unknown
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

        return this.cache = Reflect.construct(fn, $arguments, fn);
    }

    public toString(): string
    {
        return `new ${this.callee}(${this.arguments.map(x => x.toString()).join(", ")})`;
    }
}
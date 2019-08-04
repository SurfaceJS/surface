import { Indexer, Nullable } from "@surface/core";
import { hasValue }          from "@surface/core/common/generic";
import { format }            from "@surface/core/common/string";
import IExpression           from "../../interfaces/expression";
import NodeType              from "../../node-type";
import Messages              from "../messages";
import TemplateLiteral       from "./template-literal";

export default class TaggedTemplateExpression implements IExpression
{
    private cache: unknown;

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

    private _quasi: TemplateLiteral;
    public get quasi(): TemplateLiteral
    {
        return this._quasi;
    }

    /* istanbul ignore next */
    public set quasi(value: TemplateLiteral)
    {
        this._quasi = value;
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
        return NodeType.TaggedTemplateExpression;
    }

    public constructor(thisArg: IExpression, callee: IExpression, quasis: TemplateLiteral)
    {
        this._thisArg = thisArg;
        this._callee  = callee,
        this._quasi   = quasis;
    }

    public evaluate(scope: Indexer, useCache?: boolean): unknown
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        const fn = this.callee.evaluate(scope, useCache) as Nullable<Function>;

        if (!fn)
        {
            throw new ReferenceError(format(Messages.identifierIsNotDefined, { identifier: this.callee.toString() }));
        }
        else if (typeof fn != "function")
        {
            throw new TypeError(format(Messages.identifierIsNotAFunction, { identifier: this.callee.toString() }));
        }

        const cooked = this.quasi.quasis.map(x => x.cooked);
        Object.defineProperty(cooked, "raw", { value: this.quasi.quasis.map(x => x.raw) });

        return this.cache = fn.apply(this.thisArg.evaluate(scope, true), [cooked, ...this.quasi.expressions.map(x => x.evaluate(scope, useCache))]);
    }

    public toString(): string
    {
        return `${this.callee}${this.quasi}`;
    }
}
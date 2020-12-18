import { format, hasValue }           from "@surface/core";
import type IExpression               from "../interfaces/expression";
import type ITaggedTemplateExpression from "../interfaces/tagged-template-expression";
import Messages                       from "../messages.js";
import NodeType                       from "../node-type.js";
import TypeGuard                      from "../type-guard.js";
import type TemplateLiteral           from "./template-literal.js";

export default class TaggedTemplateExpression implements IExpression
{
    private cache: unknown;

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

    private _quasi: TemplateLiteral;
    public get quasi(): TemplateLiteral
    {
        return this._quasi;
    }

    /* c8 ignore next 4 */
    public set quasi(value: TemplateLiteral)
    {
        this._quasi = value;
    }

    public get type(): NodeType
    {
        return NodeType.TaggedTemplateExpression;
    }

    public constructor(callee: IExpression, quasi: TemplateLiteral)
    {
        this._callee = callee,
        this._quasi  = quasi;
    }

    public clone(): ITaggedTemplateExpression
    {
        return new TaggedTemplateExpression(this.callee.clone(), this.quasi.clone());
    }

    public evaluate(scope: object, useCache?: boolean): unknown
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        const fn = this.callee.evaluate(scope, useCache) as Function | undefined;

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

        const thisArg = TypeGuard.isMemberExpression(this.callee) ? this.callee.object.evaluate(scope, true) : null;

        return this.cache = fn.apply(thisArg, [cooked, ...this.quasi.expressions.map(x => x.evaluate(scope, useCache))]);
    }

    public toString(): string
    {
        return `${this.callee}${this.quasi}`;
    }
}
import { Indexer, Nullable } from "@surface/core";
import IExpression           from "../../interfaces/expression";
import ISpreadElement        from "../../interfaces/spread-element";
import NodeType              from "../../node-type";
import TypeGuard             from "../type-guard";
import BaseExpression        from "./abstracts/base-expression";

export default class CallExpression extends BaseExpression
{
    private readonly _context: IExpression;
    public get context(): IExpression
    {
        return this._context;
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

    private _arguments: Array<IExpression|ISpreadElement>;
    public get arguments(): Array<IExpression|ISpreadElement>
    {
        return this._arguments;
    }

    public set arguments(value: Array<IExpression|ISpreadElement>)
    {
        this._arguments = value;
    }

    public get type(): NodeType
    {
        return NodeType.Call;
    }

    public constructor(context: IExpression, callee: IExpression, $arguments: Array<IExpression|ISpreadElement>)
    {
        super();

        this._arguments = $arguments;
        this._context   = context;
        this._callee    = callee;
    }

    public evaluate(): unknown
    {
        let context = this.context.evaluate() as Indexer<Function>;
        let fn      = TypeGuard.isIdentifierExpression(this.callee) ?
            context[this.callee.name] as Nullable<Function>
            : TypeGuard.isMemberExpression(this.callee) ?
                context[this.callee.property.evaluate() as string|number] as Nullable<Function>
                : this.callee.evaluate()  as Nullable<Function>;

        if (!fn)
        {
            throw new ReferenceError(`${this.callee.toString()} is not defined`);
        }
        else if (typeof fn != "function")
        {
            throw new TypeError(`${this.callee.toString()} is not a function`);
        }

        const $arguments: Array<unknown> = [];

        for (const argument of this.arguments)
        {
            if (TypeGuard.isSpreadElement(argument))
            {
                $arguments.push(...argument.argument.evaluate() as Array<unknown>);
            }
            else
            {
                $arguments.push(argument.evaluate());
            }
        }

        return this._cache = fn.apply(context, $arguments);
    }

    public toString(): string
    {
        return `${[NodeType.Binary, NodeType.Conditional, NodeType.ArrowFunction].includes(this.callee.type) ? `(${this.callee})` : this.callee}(${this.arguments.map(x => x.toString()).join(", ")})`;
    }
}
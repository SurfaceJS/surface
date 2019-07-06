import { Indexer, Nullable } from "@surface/core";
import IExpression           from "../../interfaces/expression";
import ISpreadElement        from "../../interfaces/spread-element";
import NodeType              from "../../node-type";
import TypeGuard             from "../type-guard";
import BaseExpression        from "./abstracts/base-expression";

export default class CallExpression extends BaseExpression
{
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

    public constructor(context: IExpression, callee: IExpression, $arguments: Array<IExpression|ISpreadElement>)
    {
        super();

        this._arguments = $arguments;
        this._thisArg   = context;
        this._callee    = callee;
    }

    public evaluate(): unknown
    {
        let thisArg = this.thisArg.evaluate() as Indexer<Function>;
        let fn      = TypeGuard.isIdentifier(this.callee) ?
            thisArg[this.callee.name] as Nullable<Function>
            : TypeGuard.isMemberExpression(this.callee) ?
                thisArg[this.callee.property.evaluate() as string|number] as Nullable<Function>
                : this.callee.evaluate()  as Nullable<Function>;

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
                $arguments.push(...argument.argument.evaluate() as Array<unknown>);
            }
            else
            {
                $arguments.push(argument.evaluate());
            }
        }

        return this._cache = fn.apply(thisArg, $arguments);
    }

    public toString(): string
    {
        return `${[NodeType.BinaryExpression, NodeType.ConditionalExpression, NodeType.ArrowFunctionExpression].includes(this.callee.type) ? `(${this.callee})` : this.callee}(${this.arguments.map(x => x.toString()).join(", ")})`;
    }
}
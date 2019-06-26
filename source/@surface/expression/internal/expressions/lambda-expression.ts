import { Indexer }         from "@surface/core";
import ExpressionType      from "../../expression-type";
import IExpression         from "../../interfaces/expression";
import TypeGuard           from "../type-guard";
import BaseExpression      from "./abstracts/base-expression";
import ParameterExpression from "./parameter-expression";

export default class LambdaExpression extends BaseExpression
{
    private _body: IExpression;
    public get body(): IExpression
    {
        return this._body;
    }

    private _context: Indexer;
    public get context(): Indexer
    {
        return this._context;
    }

    private _parameters: Array<ParameterExpression>;
    public get parameters(): Array<ParameterExpression>
    {
        return this._parameters;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Lambda;
    }

    public constructor(context: Indexer, parameters: Array<ParameterExpression>, body: IExpression)
    {
        super();

        this._context    = context;
        this._parameters = parameters;
        this._body       = body;
    }

    public evaluate(): unknown
    {
        if (!this._cache)
        {
            const fn = (...args: Array<unknown>) =>
            {
                let index = 0;
                for (const parameter of this.parameters)
                {
                    if (TypeGuard.isIdentifierExpression(parameter.expression))
                    {
                        this.context[parameter.expression.name] = args[index];
                    }
                }

                const value = this.body.evaluate();

                for (const parameter of this.parameters)
                {
                    if (TypeGuard.isIdentifierExpression(parameter.expression))
                    {
                        delete this.context[parameter.expression.name];
                    }
                }

                return value;
            };

            fn.toString = () => this.toString();

            this._cache = fn;
        }

        return this._cache;
    }

    public toString(): string
    {
        return `(${this.parameters.map(x => x.toString()).join(", ")}) => ${this.body}`;
    }
}
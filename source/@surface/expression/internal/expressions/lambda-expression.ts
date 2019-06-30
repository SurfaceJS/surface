import { Indexer }         from "@surface/core";
import { coalesce }        from "@surface/core/common/generic";
import ExpressionType      from "../../expression-type";
import IExpression         from "../../interfaces/expression";
import Messages            from "../messages";
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

    private resolveParameters(args: Array<unknown>): Indexer
    {
        const scope: Indexer = { };

        let index = 0;
        for (const parameter of this.parameters)
        {
            if (TypeGuard.isIdentifierExpression(parameter.expression))
            {
                scope[parameter.expression.name] = args[index];
            }
            else if (TypeGuard.isAssignmentExpression(parameter.expression))
            {
                if (TypeGuard.isIdentifierExpression(parameter.expression.left))
                {
                    scope[parameter.expression.left.name] = coalesce(args[index], parameter.expression.right.evaluate());
                }
                else
                {
                    throw new Error(Messages.illegalPropertyInDeclarationContext);
                }
            }
            else if (TypeGuard.isRestExpression(parameter.expression))
            {
                Object.assign(scope, parameter.expression.destruct(args.slice(index)));
            }
            else
            {
                Object.assign(scope, parameter.expression.destruct(args[index] as Array<unknown>));
            }

            index++;
        }

        return scope;
    }

    public evaluate(): unknown
    {
        if (!this._cache)
        {
            const fn = (...args: Array<unknown>) =>
            {
                const scope = this.resolveParameters(args);

                const outterScope: Indexer = { ...this.context };

                Object.assign(this.context, scope);

                const value = this.body.evaluate();

                for (const key of Object.keys(scope))
                {
                    if (key in outterScope)
                    {
                        delete this.context[key];
                    }
                }

                Object.assign(this.context, outterScope);

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
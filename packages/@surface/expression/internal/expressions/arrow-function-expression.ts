import type { Indexer }              from "@surface/core";
import { proxyFrom }                 from "@surface/core";
import type IArrowFunctionExpression from "../interfaces/arrow-function-expression";
import type IExpression              from "../interfaces/expression";
import type IPattern                 from "../interfaces/pattern";
import NodeType                      from "../node-type.js";
import TypeGuard                     from "../type-guard.js";

export default class ArrowFunctionExpression implements IExpression
{
    private _body: IExpression;
    public get body(): IExpression
    {
        return this._body;
    }

    /* c8 ignore next 4 */
    public set body(value: IExpression)
    {
        this._body = value;
    }

    private _parameters: IPattern[];
    public get parameters(): IPattern[]
    {
        return this._parameters;
    }

    /* c8 ignore next 4 */
    public set parameters(value: IPattern[])
    {
        this._parameters = value;
    }

    public get type(): NodeType
    {
        return NodeType.ArrowFunctionExpression;
    }

    public constructor(parameters: IPattern[], body: IExpression)
    {
        this._parameters = parameters;
        this._body       = body;
    }

    private resolveParameters(scope: object, $arguments: unknown[]): Indexer
    {
        const currentScope: Indexer = { };

        let index = 0;

        for (const parameter of this.parameters)
        {
            if (TypeGuard.isRestElement(parameter))
            {
                Object.assign(currentScope, parameter.evaluate(scope, $arguments.slice(index)));
            }
            else
            {
                Object.assign(currentScope, parameter.evaluate(scope, $arguments[index]));
            }

            index++;
        }

        return currentScope;
    }

    public clone(): IArrowFunctionExpression
    {
        return new ArrowFunctionExpression(this.parameters.map(x => x.clone()), this.body.clone());
    }

    public evaluate(scope: object): Function
    {
        const fn = (...args: unknown[]): unknown => this.body.evaluate(proxyFrom(this.resolveParameters(scope, args), scope));

        fn.toString = () => this.toString();

        return fn;
    }

    public toString(): string
    {
        return `(${this.parameters.map(x => x.toString()).join(", ")}) => ${this.body}`;
    }
}
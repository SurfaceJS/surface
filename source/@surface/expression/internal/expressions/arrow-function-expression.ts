import { Indexer, hasValue, proxyFrom } from "@surface/core";
import Evaluate                         from "../evaluate";
import IArrowFunctionExpression         from "../interfaces/arrow-function-expression";
import IExpression                      from "../interfaces/expression";
import IPattern                         from "../interfaces/pattern";
import NodeType                         from "../node-type";

export default class ArrowFunctionExpression implements IExpression
{
    private cache: Function | null = null;

    private _body: IExpression;
    public get body(): IExpression
    {
        return this._body;
    }

    /* istanbul ignore next */
    public set body(value: IExpression)
    {
        this._body = value;
    }

    private _parameters: IPattern[];
    public get parameters(): IPattern[]
    {
        return this._parameters;
    }

    /* istanbul ignore next */
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

    private resolveParameters(scope: object, $arguments: unknown[], useCache: boolean): Indexer
    {
        const currentScope: Indexer = { };

        let index = 0;
        for (const parameter of this.parameters)
        {
            Object.assign(currentScope, Evaluate.pattern(scope, parameter, $arguments[index], $arguments.slice(index), useCache));

            index++;
        }

        return currentScope;
    }

    public clone(): IArrowFunctionExpression
    {
        return new ArrowFunctionExpression(this.parameters.map(x => x.clone()), this.body.clone());
    }

    public evaluate(scope: object, useCache?: boolean): Function
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        const fn = (...args: unknown[]): unknown => this.body.evaluate(proxyFrom(this.resolveParameters(scope, args, !!useCache), scope), useCache);

        fn.toString = () => this.toString();

        return this.cache = fn;
    }

    public toString(): string
    {
        return `(${this.parameters.map(x => x.toString()).join(", ")}) => ${this.body}`;
    }
}
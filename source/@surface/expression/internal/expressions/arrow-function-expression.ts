import { Indexer, Nullable }    from "@surface/core";
import { hasValue }             from "@surface/core/common/generic";
import { proxyFrom }            from "@surface/core/common/object";
import Evaluate                 from "../../evaluate";
import IArrowFunctionExpression from "../../interfaces/arrow-function-expression";
import IExpression              from "../../interfaces/expression";
import IPattern                 from "../../interfaces/pattern";
import NodeType                 from "../../node-type";

export default class ArrowFunctionExpression implements IExpression
{
    private cache: Nullable<Function>;

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

    private _parameters: Array<IPattern>;
    public get parameters(): Array<IPattern>
    {
        return this._parameters;
    }

    /* istanbul ignore next */
    public set parameters(value: Array<IPattern>)
    {
        this._parameters = value;
    }

    public get type(): NodeType
    {
        return NodeType.ArrowFunctionExpression;
    }

    public constructor(parameters: Array<IPattern>, body: IExpression)
    {
        this._parameters = parameters;
        this._body       = body;
    }

    private resolveParameters(scope: Indexer, $arguments: Array<unknown>, useCache: boolean): Indexer
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

    public evaluate(scope: Indexer, useCache?: boolean): Function
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        const fn = (...args: Array<unknown>) => this.body.evaluate(proxyFrom(this.resolveParameters(scope, args, !!useCache), scope), useCache);

        fn.toString = () => this.toString();

        return this.cache = fn;
    }

    public toString(): string
    {
        return `(${this.parameters.map(x => x.toString()).join(", ")}) => ${this.body}`;
    }
}
import { Indexer }  from "@surface/core";
import { hasValue } from "@surface/core/common/generic";
import IExpression  from "../../interfaces/expression";
import NodeType     from "../../node-type";

export default class ConditionalExpression implements IExpression
{
    private cache: unknown;

    private _alternate: IExpression;
    public get alternate(): IExpression
    {
        return this._alternate;
    }

    public set alternate(value: IExpression)
    {
        this._alternate = value;
    }

    private _consequent: IExpression;
    public get consequent(): IExpression
    {
        return this._consequent;
    }

    public set consequent(value: IExpression)
    {
        this._consequent = value;
    }

    private _test: IExpression;
    public get test(): IExpression
    {
        return this._test;
    }

    public set test(value: IExpression)
    {
        this._test = value;
    }

    public get type(): NodeType
    {
        return NodeType.ConditionalExpression;
    }

    public constructor(test: IExpression, alternate: IExpression, consequent: IExpression)
    {
        this._test       = test;
        this._consequent = consequent;
        this._alternate  = alternate;
    }

    public evaluate(scope: Indexer, useChache: boolean): unknown
    {
        if (useChache && hasValue(this.cache))
        {
            return this.cache;
        }

        return this.cache = this.test.evaluate(scope, useChache) ? this.alternate.evaluate(scope, useChache) : this.consequent.evaluate(scope, useChache);
    }

    public toString(): string
    {
        return `${this.test} ? ${this.alternate} : ${this.consequent}`;
    }
}
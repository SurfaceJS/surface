import IExpression    from "../../interfaces/expression";
import NodeType       from "../../node-type";
import BaseExpression from "./abstracts/base-expression";

export default class ConditionalExpression extends BaseExpression
{
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
        return NodeType.Conditional;
    }

    public constructor(test: IExpression, alternate: IExpression, consequent: IExpression)
    {
        super();

        this._test       = test;
        this._consequent = consequent;
        this._alternate  = alternate;
    }

    public evaluate(): unknown
    {
        return this._cache = this.test.evaluate() ? this.alternate.evaluate() : this.consequent.evaluate();
    }

    public toString(): string
    {
        return `${this.test} ? ${this.alternate} : ${this.consequent}`;
    }
}
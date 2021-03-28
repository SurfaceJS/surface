import type IConditionalExpression from "../interfaces/conditional-expression";
import type IExpression            from "../interfaces/expression";
import NodeType                    from "../node-type.js";

export default class ConditionalExpression implements IExpression
{
    private _alternate: IExpression;
    public get alternate(): IExpression
    {
        return this._alternate;
    }

    /* c8 ignore next 4 */
    public set alternate(value: IExpression)
    {
        this._alternate = value;
    }

    private _consequent: IExpression;
    public get consequent(): IExpression
    {
        return this._consequent;
    }

    /* c8 ignore next 4 */
    public set consequent(value: IExpression)
    {
        this._consequent = value;
    }

    private _test: IExpression;
    public get test(): IExpression
    {
        return this._test;
    }

    /* c8 ignore next 4 */
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

    public clone(): IConditionalExpression
    {
        return new ConditionalExpression(this.test.clone(), this.alternate.clone(), this.consequent.clone());
    }

    public evaluate(scope: object): unknown
    {
        return this.test.evaluate(scope) ? this.alternate.evaluate(scope) : this.consequent.evaluate(scope);
    }

    public toString(): string
    {
        return `${this.test} ? ${this.alternate} : ${this.consequent}`;
    }
}
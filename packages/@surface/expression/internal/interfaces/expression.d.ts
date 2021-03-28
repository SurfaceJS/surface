import type INode from "./node";

export default interface IExpression extends INode
{
    evaluate(scope: object): unknown;
    clone(): IExpression;
}
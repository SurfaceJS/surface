import type INode from "./node.js";

export default interface IExpression extends INode
{
    evaluate(scope: object): unknown;
    clone(): IExpression;
}
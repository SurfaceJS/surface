import INode from "./node";

export default interface IExpression extends INode
{
    evaluate(scope: object, useCache?: boolean): unknown;
    clone(): IExpression;
}
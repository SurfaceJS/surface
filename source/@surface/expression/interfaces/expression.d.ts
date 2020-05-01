import { Indexer } from "@surface/core";
import INode       from "./node";

export default interface IExpression extends INode
{
    evaluate(scope: Indexer, useCache?: boolean): unknown;
    clone(): IExpression;
}
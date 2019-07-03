import NodeType from "../node-type";
import INode    from "./node";

export default interface IExpression extends INode
{
    cache:      unknown;
    evaluate(): unknown;
}
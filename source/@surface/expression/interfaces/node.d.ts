import NodeType from "../node-type";

export default interface INode
{
    readonly type: NodeType;
    toString(): string;
}
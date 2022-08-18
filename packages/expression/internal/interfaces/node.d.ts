import type NodeType from "../node-type.js";

export default interface INode
{
    readonly type: NodeType;
    clone(): INode;
    toString(): string;
}
import type NodeType from "../node-type.js";

export default interface IElement
{
    type: NodeType;
    toString(): string;
}
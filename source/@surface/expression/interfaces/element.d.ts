import NodeType from "../node-type";

export default interface IElement
{
    type: NodeType;
    toString(): string;
}
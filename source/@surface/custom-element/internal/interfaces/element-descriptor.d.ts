import IAttributeDescriptor from "./attribute-descriptor";
import ITextNodeDescriptor  from "./text-node-descriptor";

export default interface IElementDescriptor
{
    attributes: Array<IAttributeDescriptor>;
    path:       string;
    textNodes:  Array<ITextNodeDescriptor>;
}

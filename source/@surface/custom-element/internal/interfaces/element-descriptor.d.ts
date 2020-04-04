import IAttributeDescriptor from "./attribute-descriptor";
import IDirective    from "./directive";
import ITextNodeDescriptor  from "./text-node-descriptor";

export default interface IElementDescriptor
{
    attributes: Array<IAttributeDescriptor>;
    directives: Array<IDirective>;
    path:       string;
    textNodes:  Array<ITextNodeDescriptor>;
}

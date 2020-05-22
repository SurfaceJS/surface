import IAttributeDirective from "../directives/attribute-directive";
import ICustomDirective    from "../directives/custom-directive";
import ITextNodeDescriptor from "./text-node-descriptor";

export default interface IElementDescriptor
{
    attributes: Array<IAttributeDirective>;
    directives: Array<ICustomDirective>;
    path:       string;
    textNodes:  Array<ITextNodeDescriptor>;
}

import IAttributeDirective from "./attribute-directive";
import ICustomDirective    from "./custom-directive";
import IEventDirective     from "./event-directive";
import ITextNodeDescriptor from "./text-node-descriptor";

export default interface IElementDescriptor
{
    attributes: IAttributeDirective[];
    directives: ICustomDirective[];
    events:     IEventDirective[];
    path:       string;
    textNodes:  ITextNodeDescriptor[];
}

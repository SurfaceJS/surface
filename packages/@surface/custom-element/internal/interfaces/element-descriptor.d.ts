import type IAttributeDirective from "./attribute-directive";
import type ICustomDirective    from "./custom-directive";
import type IEventDirective     from "./event-directive";
import type ITextNodeDescriptor from "./text-node-descriptor";

export default interface IElementDescriptor
{
    attributes: IAttributeDirective[];
    directives: ICustomDirective[];
    events:     IEventDirective[];
    path:       string;
    textNodes:  ITextNodeDescriptor[];
}

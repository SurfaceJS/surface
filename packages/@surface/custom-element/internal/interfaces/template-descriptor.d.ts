import type IDirectivesDescriptor from "./directives-descriptor";
import type IElementDescriptor    from "./element-descriptor";

export default interface ITemplateDescriptor
{
    directives: IDirectivesDescriptor;
    elements:   IElementDescriptor[];
    lookup:     number[][];
}


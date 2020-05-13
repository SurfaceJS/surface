import IDirectivesDescriptor from "./directives-descriptor";
import IElementDescriptor    from "./element-descriptor";

export default interface ITemplateDescriptor
{
    directives: IDirectivesDescriptor;
    elements:   Array<IElementDescriptor>;
    lookup:     Array<Array<number>>;
    parent?:     ITemplateDescriptor;
}


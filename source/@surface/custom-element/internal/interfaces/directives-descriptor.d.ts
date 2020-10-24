import IChoiceDirective      from "./choice-directive";
import IInjectDirective      from "./inject-directive";
import ILoopDirective        from "./loop-directive";
import IPlaceholderDirective from "./placeholder-directive";

export default interface IDirectivesDescriptor
{
    injections:   IInjectDirective[];
    logicals:     IChoiceDirective[];
    loops:        ILoopDirective[];
    placeholders: IPlaceholderDirective[];
}
import type IChoiceDirective      from "./choice-directive";
import type IInjectDirective      from "./inject-directive";
import type ILoopDirective        from "./loop-directive";
import type IPlaceholderDirective from "./placeholder-directive";

export default interface IDirectivesDescriptor
{
    injections:   IInjectDirective[];
    logicals:     IChoiceDirective[];
    loops:        ILoopDirective[];
    placeholders: IPlaceholderDirective[];
}
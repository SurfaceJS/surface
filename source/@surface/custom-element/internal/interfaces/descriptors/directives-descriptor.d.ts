import IChoiceDirective      from "../directives/choice-directive";
import IInjectDirective      from "../directives/inject-directive";
import ILoopDirective        from "../directives/loop-directive";
import IPlaceholderDirective from "../directives/placeholder-directive";

export default interface IDirectivesDescriptor
{
    injections:   IInjectDirective[];
    logicals:     IChoiceDirective[];
    loops:        ILoopDirective[];
    placeholders: IPlaceholderDirective[];
}
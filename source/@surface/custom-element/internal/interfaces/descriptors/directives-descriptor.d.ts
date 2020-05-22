import IChoiceDirective      from "../directives/choice-directive";
import IInjectDirective      from "../directives/inject-directive";
import IPlaceholderDirective from "../directives/placeholder-directive";
import ILoopDirective        from "../directives/loop-directive";

export default interface IDirectivesDescriptor
{
    injections:   Array<IInjectDirective>;
    logicals:     Array<IChoiceDirective>;
    loops:        Array<ILoopDirective>;
    placeholders: Array<IPlaceholderDirective>;
}
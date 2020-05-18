import IChoiceDirective   from "./choice-directive";
import IInjectDirective   from "./inject-directive";
import IInjectorDirective from "./injector-directive";
import ILoopDirective     from "./loop-directive";

export default interface IDirectivesDescriptor
{
    logical:  Array<IChoiceDirective>;
    inject:   Array<IInjectDirective>;
    injector: Array<IInjectorDirective>;
    loop:     Array<ILoopDirective>;
}

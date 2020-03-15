import IForStatement      from "./for-statement";
import IInjectStatement   from "./inject-statement";
import IInjectorStatement from "./injector-statement";
import IIfStatement       from "./If-statement";

export default interface IDirectivesDescriptor
{
    logical:     Array<IIfStatement>;
    inject:      Array<IInjectStatement>;
    injector:    Array<IInjectorStatement>;
    loop:        Array<IForStatement>;
}

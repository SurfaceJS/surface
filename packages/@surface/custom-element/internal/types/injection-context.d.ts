import type IInjectDirective          from "../interfaces/inject-directive";
import type { DirectiveHandlerEntry } from ".";

type InjectionContext =
{
    directive:        IInjectDirective,
    customDirectives: Map<string, DirectiveHandlerEntry>,
    host:             Node,
    parentNode:       Node,
    scope:            object,
    template:         HTMLTemplateElement,
};

export default InjectionContext;

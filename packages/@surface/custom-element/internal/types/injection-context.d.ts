import type InjectDirectiveDescriptor from "./inject-directive-descriptor";
import type { DirectiveEntry }        from ".";

type InjectionContext =
{
    descriptor:       InjectDirectiveDescriptor,
    customDirectives: Map<string, DirectiveEntry>,
    host:             Node,
    parentNode:       Node,
    scope:            object,
    template:         HTMLTemplateElement,
};

export default InjectionContext;

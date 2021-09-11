import type { DirectiveEntry }        from "DirectiveEntry";
import type InjectDirectiveDescriptor from "./inject-directive-descriptor-legacy";

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

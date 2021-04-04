import type IInjectDirective from "../interfaces/inject-directive";

type InjectionContext =
{
    directive:  IInjectDirective,
    host:       Node,
    parentNode: Node,
    scope:      object,
    template:   HTMLTemplateElement,
};

export default InjectionContext;

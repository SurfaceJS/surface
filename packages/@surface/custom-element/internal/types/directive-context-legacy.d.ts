import type DirectiveDescriptor from "./directive-descriptor-legacy";

type DirectiveContext =
{
    descriptor: DirectiveDescriptor,
    element:    HTMLElement,
    scope:      object,
};

export default DirectiveContext;
import type DirectiveDescriptor from "./directive-descriptor";

type DirectiveContext =
{
    descriptor: DirectiveDescriptor,
    element:    HTMLElement,
    scope:      object,
};

export default DirectiveContext;
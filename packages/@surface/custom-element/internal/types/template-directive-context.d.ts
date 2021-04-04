import type { DirectiveHandlerEntry } from ".";

type TemplateDirectiveContext =
{
    customDirectives: Map<string, DirectiveHandlerEntry>,
    host:             Node,
    parentNode:       Node,
    scope:            object,
};

export default TemplateDirectiveContext;
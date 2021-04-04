import type { DirectiveEntry } from ".";

type TemplateDirectiveContext =
{
    customDirectives: Map<string, DirectiveEntry>,
    host:             Node,
    parentNode:       Node,
    scope:            object,
};

export default TemplateDirectiveContext;
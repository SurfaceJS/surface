import { DirectiveEntry } from "DirectiveEntry";

type TemplateDirectiveContext =
{
    directives: Map<string, DirectiveEntry>,
    host:       Node,
    parentNode: Node,
    scope:      object,
};

export default TemplateDirectiveContext;
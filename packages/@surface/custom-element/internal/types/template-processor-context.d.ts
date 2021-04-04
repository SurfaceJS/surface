import type ITemplateDescriptor       from "../interfaces/template-descriptor";
import type { DirectiveHandlerEntry } from ".";

type TemplateProcessorContext =
{
    descriptor:       ITemplateDescriptor,
    customDirectives: Map<string, DirectiveHandlerEntry>,
    host:             Node | Element,
    root:             Node,
    scope:            object,
    parentNode?:      Node,
};

export default TemplateProcessorContext;
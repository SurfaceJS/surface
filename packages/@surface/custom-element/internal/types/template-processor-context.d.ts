import type TemplateDescriptor from "../template-descriptor";
import type { DirectiveEntry } from ".";

type TemplateProcessorContext =
{
    directives:         Map<string, DirectiveEntry>,
    host:               Node | Element,
    parentNode?:        Node,
    root:               Node,
    scope:              object,
    templateDescriptor: TemplateDescriptor,
};

export default TemplateProcessorContext;
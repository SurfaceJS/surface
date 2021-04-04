import type ITemplateDescriptor from "../interfaces/template-descriptor";

type TemplateProcessorContext =
{
    descriptor:  ITemplateDescriptor,
    host:        Node | Element,
    root:        Node,
    scope:       object,
    parentNode?: Node,
};

export default TemplateProcessorContext;
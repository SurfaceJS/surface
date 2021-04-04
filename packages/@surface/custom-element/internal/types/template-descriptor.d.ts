import type ElementDescriptor            from "./element-descriptor";
import type TemplateDirectivesDescriptor from "./template-directives-descriptor";

type TemplateDescriptor =
{
    directives: TemplateDirectivesDescriptor,
    elements:   ElementDescriptor[],
    lookup:     number[][],
};

export default TemplateDescriptor;
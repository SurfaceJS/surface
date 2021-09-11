import type ElementDescriptor            from "./element-descriptor-legacy";
import type TemplateDirectivesDescriptor from "./template-directives-descriptor-legacy";

type TemplateDescriptor =
{
    directives: TemplateDirectivesDescriptor,
    elements:   ElementDescriptor[],
    lookup:     number[][],
};

export default TemplateDescriptor;
import type ChoiceDirectiveDescriptor      from "./choice-directive-descriptor-legacy";
import type InjectDirectiveDescriptor      from "./inject-directive-descriptor-legacy";
import type LoopDirectiveDescriptor        from "./loop-directive-descriptor-legacy";
import type PlaceholderDirectiveDescriptor from "./placeholder-directive-descriptor-legacy";

type TemplateDirectivesDescriptor =
{
    injections:   InjectDirectiveDescriptor[],
    logicals:     ChoiceDirectiveDescriptor[],
    loops:        LoopDirectiveDescriptor[],
    placeholders: PlaceholderDirectiveDescriptor[],
};

export default TemplateDirectivesDescriptor;
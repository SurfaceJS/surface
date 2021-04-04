import type ChoiceDirectiveDescriptor      from "./choice-directive-descriptor";
import type InjectDirectiveDescriptor      from "./inject-directive-descriptor";
import type LoopDirectiveDescriptor        from "./loop-directive-descriptor";
import type PlaceholderDirectiveDescriptor from "./placeholder-directive-descriptor";

type TemplateDirectivesDescriptor =
{
    injections:   InjectDirectiveDescriptor[],
    logicals:     ChoiceDirectiveDescriptor[],
    loops:        LoopDirectiveDescriptor[],
    placeholders: PlaceholderDirectiveDescriptor[],
};

export default TemplateDirectivesDescriptor;
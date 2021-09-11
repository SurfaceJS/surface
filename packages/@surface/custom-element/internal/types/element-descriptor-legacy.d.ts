import type AttributeDirectiveDescriptor from "./attribute-directive-descriptor-legacy";
import type DirectiveDescriptor          from "./directive-descriptor-legacy";
import type EventDirectiveDescriptor     from "./event-directive-descriptor-legacy";
import type TextNodeDescriptor           from "./text-node-descriptor-legacy";

type ElementDescriptor =
{
    attributes: AttributeDirectiveDescriptor[],
    directives: DirectiveDescriptor[],
    events:     EventDirectiveDescriptor[],
    path:       tring,
    textNodes:  TextNodeDescriptor[],
};

export default ElementDescriptor;

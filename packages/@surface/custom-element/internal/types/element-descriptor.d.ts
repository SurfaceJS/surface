import type AttributeDirectiveDescriptor from "./attribute-directive-descriptor";
import type DirectiveDescriptor          from "./directive-descriptor";
import type EventDirectiveDescriptor     from "./event-directive-descriptor";
import type TextNodeDescriptor           from "./text-node-descriptor";

type ElementDescriptor =
{
    attributes: AttributeDirectiveDescriptor[],
    directives: DirectiveDescriptor[],
    events:     EventDirectiveDescriptor[],
    path:       tring,
    textNodes:  TextNodeDescriptor[],
};

export default ElementDescriptor;

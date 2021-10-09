/* eslint-disable @typescript-eslint/indent */
import CustomElementParser from "./internal/custom-element-parser.js";

export type { default as StackTrace }     from "./internal/types/stack-trace";
export type { default as ObservablePath } from "./internal/types/observable-path";
export type
{
    AttributeBindDescritor,
    BranchDescriptor,
    ChoiceStatementDescriptor,
    CommentDescriptor,
    Descriptor,
    DirectiveAttributeDescritor,
    ElementDescriptor,
    EventDescritor,
    FragmentDescriptor,
    InjectionStatementDescriptor,
    KeyValueObservable,
    LoopStatementDescriptor,
    OneWayAttributeDescritor,
    PlaceholderStatementDescriptor,
    RawAttributeDescritor,
    TextDescriptor,
    TextInterpolationDescriptor,
    TwoWayAttributeDescritor,
} from "./internal/types/descriptor";

export default CustomElementParser;
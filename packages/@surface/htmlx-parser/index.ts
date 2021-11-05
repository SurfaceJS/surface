/* eslint-disable @typescript-eslint/indent */
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

export { default as DescriptorType } from "./internal/descriptor-type.js";
export { default as Parser }         from "./internal/parser.js";
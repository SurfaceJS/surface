/* eslint-disable @typescript-eslint/indent */
export type { default as StackTrace }     from "./internal/types/stack-trace.js";
export type { default as ObservablePath } from "./internal/types/observable-path.js";
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
    KeyScopeObservable,
    LoopStatementDescriptor,
    OneWayAttributeDescritor,
    PlaceholderStatementDescriptor,
    RawAttributeDescritor,
    TextDescriptor,
    TextInterpolationDescriptor,
    TwoWayAttributeDescritor,
} from "./internal/types/descriptor.js";

export { default as SpreadFlags }    from "./internal/flags/spread-flags.js";
export { default as DescriptorType } from "./internal/descriptor-type.js";
export { default as Parser }         from "./internal/parser.js";
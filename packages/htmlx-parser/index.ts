/* eslint-disable @typescript-eslint/indent */
export type { default as StackTrace }     from "./internal/types/stack-trace.js";
export type { default as ObservablePath } from "./internal/types/observable-path.js";
export type
{
    AttributeBindDescriptor,
    BranchDescriptor,
    ChoiceStatementDescriptor,
    CommentDescriptor,
    Descriptor,
    DirectiveAttributeDescriptor,
    ElementDescriptor,
    EventDescriptor,
    FragmentDescriptor,
    InjectionStatementDescriptor,
    KeyScopeObservable,
    LoopStatementDescriptor,
    OneWayAttributeDescriptor,
    PlaceholderStatementDescriptor,
    RawAttributeDescriptor,
    TextDescriptor,
    TextInterpolationDescriptor,
    TwoWayAttributeDescriptor,
} from "./internal/types/descriptor.js";

export { default as SpreadFlags }    from "./internal/flags/spread-flags.js";
export { default as DescriptorType } from "./internal/descriptor-type.js";
export { default as Parser }         from "./internal/parser.js";

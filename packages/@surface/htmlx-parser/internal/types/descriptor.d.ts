/* eslint-disable import/exports-last */
import type { IExpression, IPattern } from "@surface/expression";
import type DescriptorType            from "../descriptor-type.js";
import type ObservablePath            from "./observable-path";
import type StackTrace                from "./stack-trace";

export type RawAttributeDescritor =
{
    key:   string,
    value: string,
    type:  DescriptorType.Attribute,
};

export type OneWayAttributeDescritor =
{
    key:         string,
    observables: ObservablePath[],
    source:      string,
    stackTrace:  StackTrace,
    type:        DescriptorType.Oneway | DescriptorType.Interpolation,
    value:       IExpression,
};

export type TwoWayAttributeDescritor =
{
    left:       string,
    right:      ObservablePath,
    source:     string,
    stackTrace: StackTrace,
    type:       DescriptorType.Twoway,
};

export type DirectiveAttributeDescritor =
{
    key:         string,
    observables: ObservablePath[],
    source:      string,
    stackTrace:  StackTrace,
    type:        DescriptorType.Directive,
    value:       IExpression,
};

export type AttributeBindDescritor =
    | DirectiveAttributeDescritor
    | EventDescritor
    | ExtendsAttributeDescriptor
    | OneWayAttributeDescritor
    | RawAttributeDescritor
    | TwoWayAttributeDescritor;

export type BranchDescriptor =
{
    expression:  IExpression,
    fragment:    FragmentDescriptor,
    observables: ObservablePath[],
    source:      string,
    stackTrace:  StackTrace,
};

export type CommentDescriptor =
{
    type:  DescriptorType.Comment,
    value: string,
};

export type ChoiceStatementDescriptor =
{
    branches: BranchDescriptor[],
    type:     DescriptorType.Choice,
};

export type ElementDescriptor =
{
    attributes: Iterable<AttributeBindDescritor>,
    childs:     Iterable<Descriptor>,
    tag:        string,
    type:       DescriptorType.Element,
};

export type ExtendsSelector = "*" | "attributes" | "binds" | `binds.${"oneway" | "twoway"}` | "listeners";

export type ExtendsAttributeDescriptor =
{
    expression: IExpression,
    source:     string,
    stackTrace: StackTrace,
    selector:   ExtendsSelector,
    type:       DescriptorType.Extends,
};

export type EventDescritor =
{
    name:        string,
    source:     string,
    stackTrace: StackTrace,
    type:       DescriptorType.Event,
    value:      IExpression,
    context:    IExpression,
};

export type FragmentDescriptor =
{
    childs: Iterable<Descriptor>,
    type:   DescriptorType.Fragment,
};

export type KeyValueObservable =
{
    key:   ObservablePath[],
    value: ObservablePath[],
};

export type InjectionStatementDescriptor =
{
    fragment:    FragmentDescriptor,
    key:         IExpression,
    type:        DescriptorType.Injection,
    scope:       IPattern,
    observables: KeyValueObservable,
    source:      { key: string, scope: string },
    stackTrace:  StackTrace,
};

export type LoopStatementDescriptor =
{
    fragment:    FragmentDescriptor,
    left:        IPattern,
    observables: ObservablePath[],
    operator:    "in" | "of",
    source:      string,
    right:       IExpression,
    stackTrace:  StackTrace,
    type:        DescriptorType.Loop,
};

export type PlaceholderStatementDescriptor =
{
    fragment:    FragmentDescriptor,
    key:         IExpression,
    type:        DescriptorType.Placeholder,
    scope:       IExpression,
    observables: KeyValueObservable,
    source:      { key: string, scope: string },
    stackTrace:  StackTrace,
};

export type TextDescriptor =
{
    type:  DescriptorType.Text,
    value: string,
};

export type TextInterpolationDescriptor =
{
    type:         DescriptorType.TextInterpolation,
    value:        IExpression,
    observables?: ObservablePath[],
    source?:      string,
    stackTrace?:  StackTrace,
};

export type Descriptor =
    | ChoiceStatementDescriptor
    | CommentDescriptor
    | ExtendsAttributeDescriptor
    | ElementDescriptor
    | FragmentDescriptor
    | InjectionStatementDescriptor
    | LoopStatementDescriptor
    | PlaceholderStatementDescriptor
    | TextDescriptor
    | TextInterpolationDescriptor;

export default Descriptor;

/* eslint-disable import/exports-last */
import type { IExpression, IPattern } from "@surface/expression";
import type DescriptorType            from "../descriptor-type.js";
import type SpreadDirectiveFlag       from "../flags/spread-flags.js";
import type ObservablePath            from "./observable-path.js";
import type StackTrace                from "./stack-trace.js";

export type RawAttributeDescriptor =
{
    name:  string,
    value: string,
    type:  DescriptorType.Attribute,
};

export type OneWayAttributeDescriptor =
{
    key:         string,
    observables: ObservablePath[],
    source:      string,
    stackTrace:  StackTrace,
    type:        DescriptorType.Oneway | DescriptorType.Interpolation,
    value:       IExpression,
};

export type TwoWayAttributeDescriptor =
{
    left:       string,
    right:      ObservablePath,
    source:     string,
    stackTrace: StackTrace,
    type:       DescriptorType.TwoWay,
};

export type DirectiveAttributeDescriptor =
{
    key:         string,
    observables: ObservablePath[],
    source:      string,
    stackTrace:  StackTrace,
    type:        DescriptorType.Directive,
    value:       IExpression,
};

export type AttributeBindDescriptor =
    | DirectiveAttributeDescriptor
    | EventDescriptor
    | OneWayAttributeDescriptor
    | RawAttributeDescriptor
    | SpreadAttributeDescriptor
    | TwoWayAttributeDescriptor;

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
    attributes: Iterable<AttributeBindDescriptor>,
    children:     Iterable<Descriptor>,
    tag:        string,
    type:       DescriptorType.Element,
};

export type SpreadAttributeDescriptor =
{
    expression:  IExpression,
    observables: ObservablePath[],
    flags:       SpreadDirectiveFlag,
    source:      string,
    stackTrace:  StackTrace,
    type:        DescriptorType.Spread,
};

export type EventDescriptor =
{
    context:    IExpression,
    listener:   IExpression,
    name:       string,
    source:     string,
    stackTrace: StackTrace,
    type:       DescriptorType.EventListener,
};

export type FragmentDescriptor =
{
    children: Iterable<Descriptor>,
    type:   DescriptorType.Fragment,
};

export type KeyScopeObservable =
{
    key:   ObservablePath[],
    scope: ObservablePath[],
};

export type InjectionStatementDescriptor =
{
    fragment:    FragmentDescriptor,
    key:         IExpression,
    type:        DescriptorType.Injection,
    scope:       IPattern,
    observables: KeyScopeObservable,
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
    observables: KeyScopeObservable,
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
    | ElementDescriptor
    | FragmentDescriptor
    | InjectionStatementDescriptor
    | LoopStatementDescriptor
    | PlaceholderStatementDescriptor
    | TextDescriptor
    | TextInterpolationDescriptor;

export default Descriptor;

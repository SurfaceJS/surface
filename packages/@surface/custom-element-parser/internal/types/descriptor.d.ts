/* eslint-disable import/exports-last */
import type { IExpression, IPattern } from "@surface/expression";
import type ObservablePath            from "./observable-path";
import type StackTrace                from "./stack-trace";

export type RawAttributeDescritor =
{
    key:   string,
    value: string,
    type:  "raw",
};

export type OneWayAttributeDescritor =
{
    key:         string,
    observables: ObservablePath[],
    source:      string,
    stackTrace:  StackTrace,
    type:        "oneway" | "interpolation",
    value:       IExpression,
};

export type TwoWayAttributeDescritor =
{
    left:       string,
    right:      ObservablePath,
    source:     string,
    stackTrace: StackTrace,
    type:       "twoway",
};

export type DirectiveAttributeDescritor =
{
    key:         string,
    observables: ObservablePath[],
    source:      string,
    stackTrace:  StackTrace,
    type:        "directive",
    value:       IExpression,
};

export type AttributeBindDescritor =
    | DirectiveAttributeDescritor
    | EventDescritor
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
    type:  "comment",
    value: string,
};

export type ChoiceStatementDescriptor =
{
    branches: BranchDescriptor[],
    type:     "choice-statement",
};

export type ElementDescriptor =
{
    attributes: Iterable<AttributeBindDescritor>,
    childs:     Iterable<Descriptor>,
    tag:        string,
    type:       "element",
};

export type EventDescritor =
{
    key:        string,
    source:     string,
    stackTrace: StackTrace,
    type:       "event",
    value:      IExpression,
    context:    IExpression,
};

export type FragmentDescriptor =
{
    childs: Iterable<Descriptor>,
    type:   "fragment",
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
    type:        "injection-statement",
    value:       IPattern,
    observables: KeyValueObservable,
    source:      { key: string, value: string },
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
    type:        "loop-statement",
};

export type PlaceholderStatementDescriptor =
{
    fragment:    FragmentDescriptor,
    key:         IExpression,
    type:        "placeholder-statement",
    value:       IExpression,
    observables: KeyValueObservable,
    source:      { key: string, value: string },
    stackTrace:  StackTrace,
};

export type TextDescriptor =
{
    type:  "text",
    value: string,
};

export type TextInterpolationDescriptor =
{
    type:         "text-interpolation",
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

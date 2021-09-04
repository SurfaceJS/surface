/* eslint-disable import/exports-last */
import type { IExpression, IPattern } from "@surface/expression";
import type ObservablePath            from "./observable-path";

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
    type:        "oneway" | "interpolation",
    value:       IExpression,
};

export type TwoWayAttributeDescritor =
{
    left:  string,
    right: ObservablePath,
    type:  "twoway",
};

export type DirectiveAttributeDescritor =
{
    key:         string,
    observables: ObservablePath[],
    type:        "directive",
    value:       IExpression,
};

export type AttributeDescritor =
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
    attributes:  Iterable<AttributeDescritor>,
    childs:      Iterable<Descriptor>,
    tag:         string,
    type:        "element",
};

export type EventDescritor =
{
    key:   string,
    value: IExpression,
    type:  "event",
};

export type EventDescritor =
{
    key:   string,
    value: IExpression,
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
    observables: KeyValueObservable,
    type:        "injection-statement",
    value:       IPattern,
};

export type LoopStatementDescriptor =
{
    fragment:    FragmentDescriptor,
    left:        IPattern,
    observables: ObservablePath[],
    operator:    "in" | "of",
    right:       IExpression,
    type:        "loop-statement",
};

export type PlaceholderStatementDescriptor =
{
    fragment:    FragmentDescriptor,
    key:         IExpression,
    observables: KeyValueObservable,
    type:        "placeholder-statement",
    value:       IExpression,
};

export type TextDescriptor =
{
    observables: ObservablePath[],
    type:        "text",
    value:       IExpression,
};

type Descriptor =
    | ChoiceStatementDescriptor
    | CommentDescriptor
    | ElementDescriptor
    | FragmentDescriptor
    | InjectionStatementDescriptor
    | LoopStatementDescriptor
    | PlaceholderStatementDescriptor
    | TextDescriptor;

export default Descriptor;

/* eslint-disable import/exports-last */
import type { IExpression, IPattern } from "@surface/expression";
import type ObservablePath            from "./observable-path";

export type FragmentDescriptor =
{
    childs: Descriptor[],
    type:   "fragment",
};

export type CommentDescriptor =
{
    value: string,
    type:  "comment",
};

export type BranchDescriptor =
{
    descriptor:  Descriptor,
    expression:  Expression,
    observables: ObservablePath[],
};

export type BindDescritor =
{
    key:         string,
    value:       IExpression,
    observables: ObservablePath[],
    type:        "oneway" | "twoway" | "interpolation",
};

export type AttributeDescritor =
{
    key:   string,
    value: string,
};

export type EventDescritor =
{
    key:   string,
    value: IExpression,
};

export type EventDescritor =
{
    key:   string,
    value: IExpression,
};

export type KeyValueObservable =
{
    key:   ObservablePath[],
    value: ObservablePath[],
};

export type ElementDescriptor =
{
    tag:         string,
    attributes:  AttributeDescritor[],
    binds:       BindDescritor[],
    events:      EventDescritor[],
    directives:  DirectiveDescritor[],
    type:        "element",
    childs:      Descriptor[],
};

export type TextDescriptor =
{
    value:       IExpression,
    observables: ObservablePath[],
    type:        "text",
};

export type ChoiceStatementDescriptor =
{
    branches: BranchDescriptor[],
    type:     "choice-statement",
};

export type LoopStatementDescriptor =
{
    left:        IPattern,
    operator:    "in" | "of",
    right:       IExpression,
    observables: ObservablePath[],
    descriptor:  Descriptor,
    type:        "loop-statement",
};

export type PlaceholderStatementDescriptor =
{
    key:         IExpression,
    value:       IExpression,
    observables: KeyValueObservable,
    descriptor:  Descriptor,
    type:        "placeholder-statement",
};

export type InjectionStatementDescriptor =
{
    key:         IExpression,
    value:       IPattern,
    observables: KeyValueObservable,
    descriptor:  Descriptor,
    type:        "injection-statement",
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

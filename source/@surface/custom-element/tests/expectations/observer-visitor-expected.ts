import { Indexer } from "@surface/core";

export type ObservableExpression   = { observers: number, expression: string, scope: Indexer };
export type UnobservableExpression = { expression: string, scope: Indexer };

export const observableExpressions: Array<ObservableExpression> =
[
    {
        expression: "left = right",
        observers:  1,
        scope:      { left: 1, right: 2 },
    },
    {
        expression: "(x = value) => 1",
        observers:  1,
        scope:      { value: 1 },
    },
    {
        expression: "(x = value1) => value2",
        observers:  2,
        scope:      { value1: 1, value2: 2 },
    },
    {
        expression: "([x = value1, y]) => 1",
        observers:  1,
        scope:      { value1: 1, value2: 2 },
    },
    {
        expression: "({ x: y = value1 }) => value1",
        observers:  2,
        scope:      { value1: 1 },
    },
];

export const unobservableExpressions: Array<UnobservableExpression> =
[
    {
        expression: "left = 1",
        scope:      { left: 0 },
    },
    {
        expression: "x => 1",
        scope:      { },
    },
    {
        expression: "(x = undefined) => 1",
        scope:      { },
    },
    {
        expression: "([x, y]) => 1",
        scope:      { },
    },
];
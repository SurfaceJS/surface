import type { Indexer } from "@surface/core";

export type Scope = { this: Indexer } & Indexer;

export type ObservableExpression = { expression: string, expected: string[][] };

export const observableExpressions: ObservableExpression[] =
[
    {
        expected:   [["this", "x"], ["this", "y"]],
        expression: "[this.x, this.y]",
    },
    {
        expected:   [["this", "y"]],
        expression: "this.x = this.y",
    },
    {
        expected:   [["this", "x"]],
        expression: "(x = this.x) => 1",
    },
    {
        expected:   [["this", "x"]],
        expression: "(x = this.x) => this.y",
    },
    {
        expected:   [["this", "x"]],
        expression: "([x = this.x, y]) => 1",
    },
    {
        expected:   [["this", "x"]],
        expression: "({ x: y = this.x }) => this.x",
    },
    {
        expected:   [["this", "x"], ["this", "y"]],
        expression: "this.x + this.y",
    },
    {
        expected:   [["this", "x"], ["this", "y"], ["this", "z"], ["this", "w"]],
        expression: "(this.x + (this.y * this.z)) / this.w",
    },
    {
        expected:   [["this", "key"], ["this", "x"]],
        expression: "this[this.key].fn(this.x)",
    },
    {
        expected:   [["this", "key"], ["this", "x"]],
        expression: "this[this.key].fn(...this.x)",
    },
    {
        expected:   [["this", "context"], ["this", "x"]],
        expression: "(null || this.context).fn(this.x)",
    },
    {
        expected:   [["this", "x"]],
        expression: "this.x ?? this.y",
    },
    {
        expected:   [["this", "x"]],
        expression: "this.x ? this.y : this.z",
    },
    {
        expected:   [["this", "x"]],
        expression: "this['x']",
    },
    {
        expected:   [["this", "x.y"]],
        expression: "this['x.y']",
    },
    {
        expected:   [["this", "key"]],
        expression: "this[this.key]",
    },
    {
        expected:   [["this", "key3"], ["this", "key2"], ["this", "key1"]],
        expression: "this[this.key1][this.key2].foo.bar[this.key3].value",
    },
    {
        expected:   [["this", "x"]],
        expression: "new this.Foo(this.x)",
    },
    {
        expected:   [["this", "x"]],
        expression: "({ x: this.x })",
    },
    {
        expected:   [["this", "key"], ["this", "value"]],
        expression: "({ [this.key]: this.value })",
    },
    {
        expected:   [["this", "x"]],
        expression: "(this.x)",
    },
    {
        expected:   [["this", "x"], ["this", "y"], ["this", "z"]],
        expression: "(this.x, this.y, this.z)",
    },
    {
        expected:   [["this", "name"]],
        expression: "this.tag`Hello ${this.name}!!!`",
    },
    {
        expected:   [["this", "flag"]],
        expression: "!this.flag",
    },
    {
        expected:   [["this", "x"], ["this", "y"]],
        expression: "(this.x || this.y).value++",
    },
];

export const unobservableExpressions: string[] =
[
    "left = 1",
    "x => 1",
    "(x = undefined) => 1",
    "(...x) => 1",
    "(...[x, y, ...z]) => 1",
    "([x, y, ...z]) => 1",
    "({ x, y, ...z }) => 1",
    "({ x, y: a = 1, ...z }) => 1",
    "this.fn()",
    "this.context.fn()",
    "(null || this).context.fn()",
    "null ?? this.y",
    "this",
    "1",
    "true ? null : undefined",
    "this.y?.x.z",
    "new this.Foo()",
    "({ x })",
    "({ x: 1 })",
    "(0)",
    "(0, 1, 2)",
    "this.tag`Hello World !!!`",
    "this.x++",
];
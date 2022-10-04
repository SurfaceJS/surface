import type { Indexer } from "@surface/core";

const skip = false;

export type Scope = { this: Indexer } & Indexer;

export type Scenarios =
{
    skip:       boolean,
    expression: string,
    expected:   string[][],
};

export const scenarios: Scenarios[] =
[
    {
        skip,
        expected:   [["this", "x"], ["this", "y"]],
        expression: "[this.x, this.y]",
    },
    {
        skip,
        expected:   [["this", "y"]],
        expression: "this.x = this.y",
    },
    {
        skip,
        expected:   [["this", "x"]],
        expression: "(x = this.x) => 1",
    },
    {
        skip,
        expected:   [["this", "x"]],
        expression: "(x = this.x) => this.y",
    },
    {
        skip,
        expected:   [["this", "x"]],
        expression: "([x = this.x, y]) => 1",
    },
    {
        skip,
        expected:   [["this", "x"]],
        expression: "({ x: y = this.x }) => this.x",
    },
    {
        skip,
        expected:   [["this", "x"], ["this", "y"]],
        expression: "this.x + this.y",
    },
    {
        skip,
        expected:   [["this", "x"], ["this", "y"], ["this", "z"], ["this", "w"]],
        expression: "(this.x + (this.y * this.z)) / this.w",
    },
    {
        skip,
        expected:   [["this", "key"], ["this", "x"]],
        expression: "this[this.key].fn(this.x)",
    },
    {
        skip,
        expected:   [["this", "key"], ["this", "x"]],
        expression: "this.key.fn(this.x)",
    },
    {
        skip,
        expected:   [["this", "key"], ["this", "x"]],
        expression: "this[this.key].fn(...this.x)",
    },
    {
        skip,
        expected:   [["this", "context"], ["this", "x"]],
        expression: "(null || this.context).fn(this.x)",
    },
    {
        skip,
        expected:   [["this", "x"]],
        expression: "this.x ?? this.y",
    },
    {
        skip,
        expected:   [["this", "x"]],
        expression: "this.x ? this.y : this.z",
    },
    {
        skip,
        expected:   [["this", "x"]],
        expression: "this['x']",
    },
    {
        skip,
        expected:   [["this", "x.y"]],
        expression: "this['x.y']",
    },
    {
        skip,
        expected:   [["this", "key"]],
        expression: "this[this.key]",
    },
    {
        skip,
        expected:   [["this", "key3"], ["this", "key2"], ["this", "key1"]],
        expression: "this[this.key1][this.key2].foo.bar[this.key3].value",
    },
    {
        skip,
        expected:   [["this", "x"]],
        expression: "new this.Foo(this.x)",
    },
    {
        skip,
        expected:   [["this", "x"]],
        expression: "({ x: this.x })",
    },
    {
        skip,
        expected:   [["this", "key"], ["this", "value"]],
        expression: "({ [this.key]: this.value })",
    },
    {
        skip,
        expected:   [["this", "x"]],
        expression: "(this.x)",
    },
    {
        skip,
        expected:   [["this", "x"], ["this", "y"], ["this", "z"]],
        expression: "(this.x, this.y, this.z)",
    },
    {
        skip,
        expected:   [["this", "name"]],
        expression: "this.tag`Hello ${this.name}!!!`",
    },
    {
        skip,
        expected:   [["this", "flag"]],
        expression: "!this.flag",
    },
    {
        skip,
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

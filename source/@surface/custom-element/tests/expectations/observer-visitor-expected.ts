import { Indexer } from "@surface/core";

export type Scope = { this: Indexer } & Indexer;

export type ObservableExpression   = { expression: string, observers: number, scope: Scope, change: (scope: Scope) => void };
export type UnobservableExpression = { expression: string, scope: Indexer };

export const observableExpressions: Array<ObservableExpression> =
[
    {
        expression: "[this.x, this.y]",
        observers:  2,
        scope:      { this: { x: 1, y: 2 } },
        change:     scope => { scope.this.x = 2; scope.this.y = 3; }
    },
    {
        expression: "this.x = this.y",
        observers:  1,
        scope:      { this: { x: 1, y: 2 } },
        change:     scope => scope.this.y = 3
    },
    {
        expression: "(x = this.x) => 1",
        observers:  1,
        scope:      { this: { x: 1 } },
        change:     scope => scope.this.x = 2,
    },
    {
        expression: "(x = this.x) => this.y",
        observers:  1,
        scope:      { this: { x: 1, y: 2 } },
        change:     scope => scope.this.x = 2,
    },
    {
        expression: "([x = this.x, y]) => 1",
        observers:  1,
        scope:      { this: { x: 1 } },
        change:     scope => scope.this.x = 2,
    },
    {
        expression: "({ x: y = this.x }) => this.x",
        observers:  1,
        scope:      { this: { x: 1 } },
        change:     scope => scope.this.x = 2,
    },
    {
        expression: "this.x + this.y",
        observers:  2,
        scope:      { this: { x: 1, y: 2 } },
        change:     scope => { scope.this.x = 2, scope.this.y = 3; }
    },
    {
        expression: "(this.x + (this.y * this.z)) / this.w",
        observers:  4,
        scope:      { this: { x: 1, y: 2, z: 3, w: 4 } },
        change:     scope => { scope.this.x = 2; scope.this.y = 3; scope.this.z = 4; scope.this.w = 5; },
    },
    {
        expression: "this.fn(this.x)",
        observers:  1,
        scope:      { this: { fn: () => 1, x: 1 } },
        change:     scope => scope.this.x = 2,
    },
    {
        expression: "this.fn(...this.x)",
        observers:  1,
        scope:      { this: { fn: () => 1, x: [1] } },
        change:     scope => scope.this.x = [1, 2],
    },
    {
        expression: "(null || this.context).fn(this.x)",
        observers:  2,
        scope:      { this: { x: 1, context: { fn: () => 2 } } },
        change:     scope => { scope.this.x = 2; scope.this.context = { fn: () => 2 }; },
    },
    {
        expression: "this.x ?? this.y",
        observers:  1,
        scope:      { this: { x: null, y: 1 } },
        change:     scope => scope.this.x = 2,
    },
    {
        expression: "this.x ? this.y : this.z",
        observers:  1,
        scope:      { this: { x: 1, y: 2, z: 3 } },
        change:     scope => scope.this.x = 2,
    },
    {
        expression: "this['x']",
        observers:  1,
        scope:      { this: { x: 1 } },
        change:     scope => scope.this.x = 2,
    },
    {
        expression: "this['x.y']",
        observers:  1,
        scope:      { this: { "x.y": 1 } },
        change:     scope => scope.this["x.y"] = 2,
    },
    {
        expression: "this[this.key]",
        observers:  1,
        scope:      { this: { x: 1, key: "x" } },
        change:     scope => scope.this.key = "z",
    },
    {
        expression: "new this.Foo(this.x)",
        observers:  1,
        scope:      { this: { Foo: class Foo { }, x: 1 } },
        change:     scope => scope.this.x = 2,
    },
    {
        expression: "({ x: this.x })",
        observers:  1,
        scope:      { this: { x: 1 } },
        change:     scope => scope.this.x = 2,
    },
    {
        expression: "({ [this.key]: this.value })",
        observers:  2,
        scope:      { this: { key: "id", value: 1 } },
        change:     scope => { scope.this.key = "_"; scope.this.value = 2; },
    },
    {
        expression: "(this.x)",
        observers:  1,
        scope:      { this: { x: 1 }},
        change:     scope => scope.this.x = 2,
    },
    {
        expression: "(this.x, this.y, this.z)",
        observers:  3,
        scope:      { this: { x: 1, y: 2, z: 2 } },
        change:     scope => { scope.this.x = 2; scope.this.y = 3; scope.this.z = 4; },
    },
    {
        expression: "this.tag`Hello ${this.name}!!!`",
        observers:  1,
        scope:      { this: { tag: (...args: Array<unknown>) => args, name: "World" } },
        change:     scope => scope.this.name = "Coders",
    },
    {
        expression: "!this.flag",
        observers:  1,
        scope:      { this: { flag: true } },
        change:     scope => scope.this.flag = false,
    },
    {
        expression: "(this.x || this.y).value++",
        observers:  2,
        scope:      { this: { x: { value: 1 }, y: { value: 1 } } },
        change:     scope => { scope.this.x = { value: 2 }; scope.this.y = { value: 2 }; },
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
        expression: "(...x) => 1",
        scope:      { },
    },
    {
        expression: "(...[x, y, ...z]) => 1",
        scope:      { },
    },
    {
        expression: "([x, y, ...z]) => 1",
        scope:      { },
    },
    {
        expression: "({ x, y, ...z }) => 1",
        scope:      { },
    },
    {
        expression: "({ x, y: a = 1, ...z }) => 1",
        scope:      { },
    },
    {
        expression: "this.fn()",
        scope:      { this: { fn: () => 1, }},
    },
    {
        expression: "this.context.fn()",
        scope:      { this: { context: { fn: () => 1 }}},
    },
    {
        expression: "(null || this).context.fn()",
        scope:      { this: { context: { fn: () => 1 }}},
    },
    {
        expression: "null ?? this.y",
        scope:      { this: { x: null, y: 1 }},
    },
    {
        expression: "this",
        scope:      { this: { }},
    },
    {
        expression: "1",
        scope:      { this: { }},
    },
    {
        expression: "true ? null : undefined",
        scope:      { this: { }},
    },
    {
        expression: "this?.x",
        scope:      { this: { }},
    },
    {
        expression: "new this.Foo()",
        scope:      { this: { Foo: class Foo { } }},
    },
    {
        expression: "({ x })",
        scope:      { },
    },
    {
        expression: "({ x: 1 })",
        scope:      { },
    },
    {
        expression: "(0)",
        scope:      { },
    },
    {
        expression: "(0, 1, 2)",
        scope:      { },
    },
    {
        expression: "this.tag`Hello World !!!`",
        scope:      { this: { tag: (...args: Array<unknown>) => args } },
    },
    {
        expression: "this.x++",
        scope:      { this: { x: 1 } },
    },
];
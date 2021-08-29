/* eslint-disable max-lines-per-function */
// eslint-disable-next-line import/no-unassigned-import
import "../fixtures/dom.js";

import type { Indexer }            from "@surface/core";
import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import TemplateParser              from "../../internal/aot/template-parser.js";
import type { FragmentDescriptor } from "../../internal/aot/types/descriptor";
import { parseDestructuredPattern, parseExpression }         from "../../internal/parsers/expression-parsers.js";

function stringfyFuncions<T extends object>(target: T): T;
function stringfyFuncions(target: Indexer): Indexer
{
    for (const [key, value] of Object.entries(target))
    {
        if (value instanceof Object)
        {
            if ("evaluate" in value || typeof value == "function")
            {
                target[key] = String(value);
            }
            else
            {
                target[key] = stringfyFuncions(value);
            }
        }
    }

    return target;
}

@suite
export default class TemplateParserSpec
{
    @shouldPass @test
    public analyze(): void
    {
        const template =
        [
            "<span foo bar=\"baz\" value=\"Hello {host.name}\" @click=\"host.handler\" ::value-a=\"host.value\" :value-b=\"host.x + host.y\">Some {'interpolation'} here</span>",
            "<span #inject>Empty</span>",
            "<span #inject:title=\"{ title }\"><h1>{title}</h1></span>",
            "<span #inject=\"{ title }\" #inject-key=\"host.dynamicInjectKey\"><h1>{title}</h1></span>",
            "<hr>",
            "<span #if=\"host.status == 1\">Active</span>",
            "<!--Will be ignored-->",
            "<span #else-if=\"host.status == 2\">Waiting</span>",
            "Will be ignored and show warning",
            "<span #else>Suspended</span>",
            "<span #placeholder>Default Empty</span>",
            "<span #placeholder:value=\"{ name: host.name }\">Default {name}</span>",
            "<span #placeholder=\"{ name: host.name }\" #placeholder-key=\"host.dynamicPlaceholderKey\">Default {name}</span>",
            "<table>",
            "<tr>",
            "<th>Id</th>",
            "<th>Name</th>",
            "<th>Status</th>",
            "</tr>",
            "<tr onclick=\"fn({ clicked })\" #for=\"const item of host.items\">",
            "<td>{item.id}</td>",
            "<td>{item.name}</td>",
            "<td>{item.status}</td>",
            "</tr>",
            "</table>",
            "<hr>",
            "<script>console.log({ window });</script>",
            "<style>h1 { color: red }</style>",
            "<!--This is a comment-->",
        ].join("");

        const expected: FragmentDescriptor =
        {
            childs:
            [
                {
                    attributes:
                    [
                        { key: "foo", value: "" },
                        { key: "bar", value: "baz" },
                    ],
                    binds:
                    [
                        {
                            key:         "value",
                            observables: [["host", "name"]],
                            type:        "interpolation",
                            value:       parseExpression("`Hello ${host.name}`"),
                        },
                        {
                            key:         "valueA",
                            observables: [["host", "value"]],
                            type:        "twoway",
                            value:       parseExpression("host.value"),
                        },
                        {
                            key:         "valueB",
                            observables: [["host", "x"], ["host", "y"]],
                            type:        "oneway",
                            value:       parseExpression("host.x + host.y"),
                        },
                    ],
                    childs:
                    [
                        {
                            observables: [],
                            type:        "text",
                            value:       parseExpression("`Some ${'interpolation'} here`"),
                        },
                    ],
                    directives: [],
                    events:
                    [
                        { key: "click", value: parseExpression("host.handler") },
                    ],
                    tag:  "SPAN",
                    type: "element",
                },
                {
                    descriptor:
                    {
                        childs:
                        [
                            {
                                attributes: [],
                                binds:      [],
                                childs:
                                [
                                    {
                                        observables: [],
                                        type:        "text",
                                        value:       parseExpression("\"Empty\""),
                                    },
                                ],
                                directives: [],
                                events:     [],
                                tag:        "SPAN",
                                type:       "element",
                            },
                        ],
                        type: "fragment",
                    },
                    key:         parseExpression("'default'"),
                    observables: { key: [], value: [] },
                    type:        "injection-statement",
                    value:       parseDestructuredPattern("{}"),
                },
                {
                    descriptor:
                    {
                        childs:
                        [
                            {
                                attributes: [],
                                binds:      [],
                                childs:
                                [
                                    {
                                        attributes: [],
                                        binds:      [],
                                        childs:
                                        [
                                            {
                                                observables: [],
                                                type:        "text",
                                                value:       parseExpression("`${title}`"),
                                            },
                                        ],
                                        directives: [],
                                        events:     [],
                                        tag:        "H1",
                                        type:       "element",
                                    },
                                ],
                                directives: [],
                                events:     [],
                                tag:        "SPAN",
                                type:       "element",
                            },
                        ],
                        type: "fragment",
                    },
                    key:         parseExpression("'title'"),
                    observables: { key: [], value: [] },
                    type:        "injection-statement",
                    value:       parseDestructuredPattern("{ title }"),
                },
                {
                    descriptor:
                    {
                        childs:
                        [
                            {
                                attributes: [],
                                binds:      [],
                                childs:
                                [
                                    {
                                        attributes: [],
                                        binds:      [],
                                        childs:
                                        [
                                            {
                                                observables: [],
                                                type:        "text",
                                                value:       parseExpression("`${title}`"),
                                            },
                                        ],
                                        directives: [],
                                        events:     [],
                                        tag:        "H1",
                                        type:       "element",
                                    },
                                ],
                                directives: [],
                                events:     [],
                                tag:        "SPAN",
                                type:       "element",
                            },
                        ],
                        type: "fragment",
                    },
                    key:         parseExpression("host.dynamicInjectKey"),
                    observables: { key: [["host", "dynamicInjectKey"]], value: [] },
                    type:        "injection-statement",
                    value:       parseDestructuredPattern("{ title }"),
                },
                {
                    attributes: [],
                    binds:      [],
                    childs:     [],
                    directives: [],
                    events:     [],
                    tag:        "HR",
                    type:       "element",
                },
                {
                    branches:
                    [
                        {
                            descriptor:
                            {
                                childs:
                                [
                                    {
                                        attributes: [],
                                        binds:      [],
                                        childs:
                                        [
                                            {
                                                observables: [],
                                                type:        "text",
                                                value:       parseExpression("'Active'"),
                                            },
                                        ],
                                        directives: [],
                                        events:     [],
                                        tag:        "SPAN",
                                        type:       "element",
                                    },
                                ],
                                type: "fragment",
                            },
                            expression:  parseExpression("host.status == 1"),
                            observables: [["host", "status"]],
                        },
                        {
                            descriptor:
                            {
                                childs:
                                [
                                    {
                                        attributes: [],
                                        binds:      [],
                                        childs:
                                        [
                                            {
                                                observables: [],
                                                type:        "text",
                                                value:       parseExpression("'Waiting'"),
                                            },
                                        ],
                                        directives: [],
                                        events:     [],
                                        tag:        "SPAN",
                                        type:       "element",
                                    },
                                ],
                                type: "fragment",
                            },
                            expression:  parseExpression("host.status == 2"),
                            observables: [["host", "status"]],
                        },
                        {
                            descriptor:
                            {
                                childs:
                                [
                                    {
                                        attributes: [],
                                        binds:      [],
                                        childs:
                                        [
                                            {
                                                observables: [],
                                                type:        "text",
                                                value:       parseExpression("'Suspended'"),
                                            },
                                        ],
                                        directives: [],
                                        events:     [],
                                        tag:        "SPAN",
                                        type:       "element",
                                    },
                                ],
                                type: "fragment",
                            },
                            expression:  parseExpression("true"),
                            observables: [],
                        },
                    ],
                    type: "choice-statement",
                },
                {
                    descriptor:
                    {
                        childs:
                        [
                            {
                                attributes: [],
                                binds:      [],
                                childs:
                                [
                                    {
                                        observables: [],
                                        type:        "text",
                                        value:       parseExpression("'Default Empty'"),
                                    },
                                ],
                                directives: [],
                                events:     [],
                                tag:        "SPAN",
                                type:       "element",
                            },
                        ],
                        type:   "fragment",
                    },
                    key:         parseExpression("'default'"),
                    observables: { key: [], value: [] },
                    type:        "placeholder-statement",
                    value:       parseExpression("undefined"),
                },
                {
                    descriptor:
                    {
                        childs:
                        [
                            {
                                attributes: [],
                                binds:      [],
                                childs:
                                [
                                    {
                                        observables: [],
                                        type:        "text",
                                        value:       parseExpression("`Default ${name}`"),
                                    },
                                ],
                                directives: [],
                                events:     [],
                                tag:        "SPAN",
                                type:       "element",
                            },
                        ],
                        type:   "fragment",
                    },
                    key:         parseExpression("'value'"),
                    observables: { key: [], value: [["host", "name"]] },
                    type:        "placeholder-statement",
                    value:       parseExpression("{ name: host.name }"),
                },
                {
                    descriptor:
                    {
                        childs:
                        [
                            {
                                attributes: [],
                                binds:      [],
                                childs:
                                [
                                    {
                                        observables: [],
                                        type:        "text",
                                        value:       parseExpression("`Default ${name}`"),
                                    },
                                ],
                                directives: [],
                                events:     [],
                                tag:        "SPAN",
                                type:       "element",
                            },
                        ],
                        type:   "fragment",
                    },
                    key:         parseExpression("host.dynamicPlaceholderKey"),
                    observables: { key: [["host", "dynamicPlaceholderKey"]], value: [["host", "name"]] },
                    type:        "placeholder-statement",
                    value:       parseExpression("{ name: host.name }"),
                },
                {
                    attributes: [],
                    binds:      [],
                    childs:
                    [
                        {
                            attributes: [],
                            binds:      [],
                            childs:
                            [
                                {
                                    attributes: [],
                                    binds:      [],
                                    childs:
                                    [
                                        {
                                            attributes: [],
                                            binds:      [],
                                            childs:
                                            [
                                                {
                                                    observables: [],
                                                    type:        "text",
                                                    value:       parseExpression("'Id'"),
                                                },
                                            ],
                                            directives: [],
                                            events:     [],
                                            tag:        "TH",
                                            type:       "element",
                                        },
                                        {
                                            attributes: [],
                                            binds:      [],
                                            childs:
                                            [
                                                {
                                                    observables: [],
                                                    type:        "text",
                                                    value:       parseExpression("'Name'"),
                                                },
                                            ],
                                            directives: [],
                                            events:     [],
                                            tag:        "TH",
                                            type:       "element",
                                        },
                                        {
                                            attributes: [],
                                            binds:      [],
                                            childs:
                                            [
                                                {
                                                    observables: [],
                                                    type:        "text",
                                                    value:       parseExpression("'Status'"),
                                                },
                                            ],
                                            directives: [],
                                            events:     [],
                                            tag:        "TH",
                                            type:       "element",
                                        },
                                    ],
                                    directives: [],
                                    events:     [],
                                    tag:        "TR",
                                    type:       "element",
                                },
                                {
                                    descriptor:
                                    {
                                        childs:
                                        [
                                            {
                                                attributes: [{ key: "onclick", value: "fn({ clicked })" }],
                                                binds:      [],
                                                childs:
                                                [
                                                    {
                                                        attributes: [],
                                                        binds:      [],
                                                        childs:
                                                        [
                                                            {
                                                                observables: [["item", "id"]],
                                                                type:        "text",
                                                                value:       parseExpression("`${item.id}`"),
                                                            },
                                                        ],
                                                        directives: [],
                                                        events:     [],
                                                        tag:        "TD",
                                                        type:       "element",
                                                    },
                                                    {
                                                        attributes: [],
                                                        binds:      [],
                                                        childs:
                                                        [
                                                            {
                                                                observables: [["item", "name"]],
                                                                type:        "text",
                                                                value:       parseExpression("`${item.name}`"),
                                                            },
                                                        ],
                                                        directives: [],
                                                        events:     [],
                                                        tag:        "TD",
                                                        type:       "element",
                                                    },
                                                    {
                                                        attributes: [],
                                                        binds:      [],
                                                        childs:
                                                        [
                                                            {
                                                                observables: [["item", "status"]],
                                                                type:        "text",
                                                                value:       parseExpression("`${item.status}`"),
                                                            },
                                                        ],
                                                        directives: [],
                                                        events:     [],
                                                        tag:        "TD",
                                                        type:       "element",
                                                    },
                                                ],
                                                directives: [],
                                                events:     [],
                                                tag:        "TR",
                                                type:       "element",
                                            },
                                        ],
                                        type: "fragment",
                                    },
                                    left:        parseDestructuredPattern("item"),
                                    observables: [["host", "items"]],
                                    operator:    "of",
                                    right:       parseExpression("host.items"),
                                    type:        "loop-statement",
                                },
                            ],
                            directives: [],
                            events:     [],
                            tag:        "TBODY",
                            type:       "element",
                        },
                    ],
                    directives: [],
                    events:     [],
                    tag:        "TABLE",
                    type:       "element",
                },
                {
                    attributes: [],
                    binds:      [],
                    childs:     [],
                    directives: [],
                    events:     [],
                    tag:        "HR",
                    type:       "element",
                },
                {
                    attributes: [],
                    binds:      [],
                    childs:
                    [
                        {
                            observables: [],
                            type:        "text",
                            value:       parseExpression("'console.log({ window });'"),
                        },
                    ],
                    directives: [],
                    events:     [],
                    tag:        "SCRIPT",
                    type:       "element",
                },
                {
                    attributes: [],
                    binds:      [],
                    childs:
                    [
                        {
                            observables: [],
                            type:        "text",
                            value:       parseExpression("'h1 { color: red }'"),
                        },
                    ],
                    directives: [],
                    events:     [],
                    tag:        "STYLE",
                    type:       "element",
                },
                {
                    type:  "comment",
                    value: "This is a comment",
                },
            ],
            type: "fragment",
        };

        const actual = TemplateParser.parse("x-component", template);

        const a = stringfyFuncions(actual);
        const e = stringfyFuncions(expected);

        chai.assert.deepEqual(a, e);
    }
}
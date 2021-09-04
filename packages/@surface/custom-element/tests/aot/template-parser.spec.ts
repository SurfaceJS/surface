/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
// eslint-disable-next-line import/no-unassigned-import
import "../fixtures/dom.js";

import type { Delegate, Indexer }                    from "@surface/core";
import { isIterable, resolveError }                  from "@surface/core";
import { shouldFail, shouldPass, suite, test }       from "@surface/test-suite";
import chai                                          from "chai";
import TemplateParser                                from "../../internal/aot/template-parser.js";
import type Descriptor                               from "../../internal/aot/types/descriptor";
import TemplateParseError                            from "../../internal/errors/template-parse-error.js";
import { parseDestructuredPattern, parseExpression } from "../../internal/parsers/expression-parsers.js";

type RawError = { message: string } | Pick<TemplateParseError, "message" | "stack">;

function resolveValue(value: unknown): unknown
{
    if (value instanceof Object)
    {
        if ("evaluate" in value || typeof value == "function")
        {
            return String(value);
        }

        return stringifyExpressions(value as Indexer);

    }

    return value;
}

function stringifyExpressions(target: Indexer): Indexer
{
    if (isIterable(target))
    {
        const result = [];

        for (const value of target)
        {
            result.push(resolveValue(value));
        }

        return result as Indexer;
    }

    const result: Indexer = { };

    for (const [key, value] of Object.entries(target))
    {
        result[key] = resolveValue(value);
    }

    return result;

}

function tryAction(action: Delegate): RawError
{
    try
    {
        action();
    }
    catch (error)
    {
        return toRaw(resolveError(error));
    }

    return toRaw(new TemplateParseError("", ""));
}

function toRaw(error: Error): RawError
{
    if (error instanceof TemplateParseError)
    {
        return {
            message: error.message,
            stack:   error.stack,
        };
    }

    return { message: error.message };
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

        const expected: Descriptor =
        {
            childs:
            [
                {
                    attributes:
                    [
                        {
                            key:   "foo",
                            type:  "raw",
                            value: "",
                        },
                        {
                            key:   "bar",
                            type:  "raw",
                            value: "baz",
                        },
                        {
                            key:   "value",
                            type:  "raw",
                            value: "",
                        },
                        {
                            key:         "value",
                            observables: [["host", "name"]],
                            type:        "interpolation",
                            value:       parseExpression("`Hello ${host.name}`"),
                        },
                        {
                            key:   "click",
                            type:  "event",
                            value: parseExpression("host.handler"),
                        },
                        {
                            left:  "valueA",
                            right: ["host", "value"],
                            type:  "twoway",
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
                    tag:  "SPAN",
                    type: "element",
                },
                {
                    fragment:
                    {
                        childs:
                        [
                            {
                                attributes: [],
                                childs:
                                [
                                    {
                                        observables: [],
                                        type:        "text",
                                        value:       parseExpression("\"Empty\""),
                                    },
                                ],
                                tag:  "SPAN",
                                type: "element",
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
                    fragment:
                    {
                        childs:
                        [
                            {
                                attributes: [],
                                childs:
                                [
                                    {
                                        attributes: [],
                                        childs:
                                        [
                                            {
                                                observables: [],
                                                type:        "text",
                                                value:       parseExpression("`${title}`"),
                                            },
                                        ],
                                        tag:        "H1",
                                        type:       "element",
                                    },
                                ],
                                tag:  "SPAN",
                                type: "element",
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
                    fragment:
                    {
                        childs:
                        [
                            {
                                attributes: [],
                                childs:
                                [
                                    {
                                        attributes: [],
                                        childs:
                                        [
                                            {
                                                observables: [],
                                                type:        "text",
                                                value:       parseExpression("`${title}`"),
                                            },
                                        ],
                                        tag:  "H1",
                                        type: "element",
                                    },
                                ],
                                tag:  "SPAN",
                                type: "element",
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
                    childs:     [],
                    tag:        "HR",
                    type:       "element",
                },
                {
                    branches:
                    [
                        {
                            expression:  parseExpression("host.status == 1"),
                            fragment:
                            {
                                childs:
                                [
                                    {
                                        attributes: [],
                                        childs:
                                        [
                                            {
                                                observables: [],
                                                type:        "text",
                                                value:       parseExpression("'Active'"),
                                            },
                                        ],
                                        tag:  "SPAN",
                                        type: "element",
                                    },
                                ],
                                type: "fragment",
                            },
                            observables: [["host", "status"]],
                        },
                        {
                            expression:  parseExpression("host.status == 2"),
                            fragment:
                            {
                                childs:
                                [
                                    {
                                        attributes: [],
                                        childs:
                                        [
                                            {
                                                observables: [],
                                                type:        "text",
                                                value:       parseExpression("'Waiting'"),
                                            },
                                        ],
                                        tag:  "SPAN",
                                        type: "element",
                                    },
                                ],
                                type: "fragment",
                            },
                            observables: [["host", "status"]],
                        },
                        {
                            expression:  parseExpression("true"),
                            fragment:
                            {
                                childs:
                                [
                                    {
                                        attributes: [],
                                        childs:
                                        [
                                            {
                                                observables: [],
                                                type:        "text",
                                                value:       parseExpression("'Suspended'"),
                                            },
                                        ],
                                        tag:  "SPAN",
                                        type: "element",
                                    },
                                ],
                                type: "fragment",
                            },
                            observables: [],
                        },
                    ],
                    type: "choice-statement",
                },
                {
                    fragment:
                    {
                        childs:
                        [
                            {
                                attributes: [],
                                childs:
                                [
                                    {
                                        observables: [],
                                        type:        "text",
                                        value:       parseExpression("'Default Empty'"),
                                    },
                                ],
                                tag:  "SPAN",
                                type: "element",
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
                    fragment:
                    {
                        childs:
                        [
                            {
                                attributes: [],
                                childs:
                                [
                                    {
                                        observables: [],
                                        type:        "text",
                                        value:       parseExpression("`Default ${name}`"),
                                    },
                                ],
                                tag:  "SPAN",
                                type: "element",
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
                    fragment:
                    {
                        childs:
                        [
                            {
                                attributes: [],
                                childs:
                                [
                                    {
                                        observables: [],
                                        type:        "text",
                                        value:       parseExpression("`Default ${name}`"),
                                    },
                                ],
                                tag:  "SPAN",
                                type: "element",
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
                    childs:
                    [
                        {
                            attributes: [],
                            childs:
                            [
                                {
                                    attributes: [],
                                    childs:
                                    [
                                        {
                                            attributes: [],
                                            childs:
                                            [
                                                {
                                                    observables: [],
                                                    type:        "text",
                                                    value:       parseExpression("'Id'"),
                                                },
                                            ],
                                            tag:  "TH",
                                            type: "element",
                                        },
                                        {
                                            attributes: [],
                                            childs:
                                            [
                                                {
                                                    observables: [],
                                                    type:        "text",
                                                    value:       parseExpression("'Name'"),
                                                },
                                            ],
                                            tag:  "TH",
                                            type: "element",
                                        },
                                        {
                                            attributes: [],
                                            childs:
                                            [
                                                {
                                                    observables: [],
                                                    type:        "text",
                                                    value:       parseExpression("'Status'"),
                                                },
                                            ],
                                            tag:  "TH",
                                            type: "element",
                                        },
                                    ],
                                    tag:  "TR",
                                    type: "element",
                                },
                                {
                                    fragment:
                                    {
                                        childs:
                                        [
                                            {
                                                attributes: [{ key: "onclick", type: "raw", value: "fn({ clicked })" }],
                                                childs:
                                                [
                                                    {
                                                        attributes: [],
                                                        childs:
                                                        [
                                                            {
                                                                observables: [["item", "id"]],
                                                                type:        "text",
                                                                value:       parseExpression("`${item.id}`"),
                                                            },
                                                        ],
                                                        tag:  "TD",
                                                        type: "element",
                                                    },
                                                    {
                                                        attributes: [],
                                                        childs:
                                                        [
                                                            {
                                                                observables: [["item", "name"]],
                                                                type:        "text",
                                                                value:       parseExpression("`${item.name}`"),
                                                            },
                                                        ],
                                                        tag:  "TD",
                                                        type: "element",
                                                    },
                                                    {
                                                        attributes: [],
                                                        childs:
                                                        [
                                                            {
                                                                observables: [["item", "status"]],
                                                                type:        "text",
                                                                value:       parseExpression("`${item.status}`"),
                                                            },
                                                        ],
                                                        tag:  "TD",
                                                        type: "element",
                                                    },
                                                ],
                                                tag:  "TR",
                                                type: "element",
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
                            tag:  "TBODY",
                            type: "element",
                        },
                    ],
                    tag:  "TABLE",
                    type: "element",
                },
                {
                    attributes: [],
                    childs:     [],
                    tag:        "HR",
                    type:       "element",
                },
                {
                    attributes: [],
                    childs:
                    [
                        {
                            observables: [],
                            type:        "text",
                            value:       parseExpression("'console.log({ window });'"),
                        },
                    ],
                    tag:  "SCRIPT",
                    type: "element",
                },
                {
                    attributes: [],
                    childs:
                    [
                        {
                            observables: [],
                            type:        "text",
                            value:       parseExpression("'h1 { color: red }'"),
                        },
                    ],
                    tag:  "STYLE",
                    type: "element",
                },
                {
                    type:  "comment",
                    value: "This is a comment",
                },
            ],
            type: "fragment",
        };

        const actual = TemplateParser.parse("x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        chai.assert.deepEqual(a, e);
    }

    @shouldPass @test
    public decomposeIfAndFor(): void
    {
        const template = "<span #if=\"true\" #for=\"const item of items\">{item.value}</span>";

        const expected: Descriptor =
        {
            childs:
            [
                {
                    branches:
                    [
                        {
                            expression: parseExpression("true"),
                            fragment:
                            {
                                childs:
                                [
                                    {
                                        fragment:
                                        {
                                            childs:
                                            [
                                                {
                                                    attributes: [],
                                                    childs:
                                                    [
                                                        {
                                                            observables: [["item", "value"]],
                                                            type:        "text",
                                                            value:       parseExpression("`${item.value}`"),
                                                        },
                                                    ],
                                                    tag:  "SPAN",
                                                    type: "element",
                                                },
                                            ],
                                            type:   "fragment",
                                        },
                                        left:        parseDestructuredPattern("item"),
                                        observables: [],
                                        operator:    "of",
                                        right:       parseExpression("items"),
                                        type:        "loop-statement",
                                    },
                                ],
                                type: "fragment",
                            },
                            observables: [],
                        },
                    ],
                    type: "choice-statement",
                },
            ],
            type: "fragment",
        };

        const actual = TemplateParser.parse("x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        chai.assert.deepEqual(a, e);
    }

    @shouldPass @test
    public decomposeIfAndPlaceholder(): void
    {
        const template = "<span #if=\"true\" #placeholder:value=\"source\">Placeholder</span>";

        const expected: Descriptor =
        {
            childs:
            [
                {
                    branches:
                    [
                        {
                            expression: parseExpression("true"),
                            fragment:
                            {
                                childs:
                                [
                                    {
                                        fragment:
                                        {
                                            childs:
                                            [
                                                {
                                                    attributes: [],
                                                    childs:
                                                    [
                                                        {
                                                            observables: [],
                                                            type:        "text",
                                                            value:       parseExpression("'Placeholder'"),
                                                        },
                                                    ],
                                                    tag:  "SPAN",
                                                    type: "element",
                                                },
                                            ],
                                            type:   "fragment",
                                        },
                                        key:         parseExpression("'value'"),
                                        observables: { key: [], value: [] },
                                        type:        "placeholder-statement",
                                        value:       parseExpression("source"),
                                    },
                                ],
                                type: "fragment",
                            },
                            observables: [],
                        },
                    ],
                    type: "choice-statement",
                },
            ],
            type: "fragment",
        };

        const actual = TemplateParser.parse("x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        chai.assert.deepEqual(a, e);
    }

    @shouldPass @test
    public decomposeForAndPlaceholder(): void
    {
        const template = "<span #for=\"const [key, value] of items\" #placeholder-key=\"key\" #placeholder=\"source\">{source.value}</span>";

        const expected: Descriptor =
        {
            childs:
            [
                {
                    fragment:
                    {
                        childs:
                        [
                            {
                                fragment:
                                {
                                    childs:
                                    [
                                        {
                                            attributes: [],
                                            childs:
                                            [
                                                {
                                                    observables: [["source", "value"]],
                                                    type:        "text",
                                                    value:       parseExpression("`${source.value}`"),
                                                },
                                            ],
                                            tag:  "SPAN",
                                            type: "element",
                                        },
                                    ],
                                    type:   "fragment",
                                },
                                key:         parseExpression("key"),
                                observables: { key: [], value: [] },
                                type:        "placeholder-statement",
                                value:       parseExpression("source"),
                            },
                        ],
                        type: "fragment",
                    },
                    left:        parseDestructuredPattern("[key, value]"),
                    observables: [],
                    operator:    "of",
                    right:       parseExpression("items"),
                    type:        "loop-statement",
                },
            ],
            type: "fragment",
        };

        const actual = TemplateParser.parse("x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        chai.assert.deepEqual(a, e);
    }

    @shouldPass @test
    public decomposeIfAndInject(): void
    {
        const template = "<span #if=\"true\" #inject:value=\"source\">{source.value}</span>";

        const expected: Descriptor =
        {
            childs:
            [
                {
                    branches:
                    [
                        {
                            expression: parseExpression("true"),
                            fragment:
                            {
                                childs:
                                [
                                    {
                                        fragment:
                                        {
                                            childs:
                                            [
                                                {
                                                    attributes: [],
                                                    childs:
                                                    [
                                                        {
                                                            observables: [["source", "value"]],
                                                            type:        "text",
                                                            value:       parseExpression("`${source.value}`"),
                                                        },
                                                    ],
                                                    tag:  "SPAN",
                                                    type: "element",
                                                },
                                            ],
                                            type:   "fragment",
                                        },
                                        key:         parseExpression("'value'"),
                                        observables: { key: [], value: [] },
                                        type:        "injection-statement",
                                        value:       parseDestructuredPattern("source"),
                                    },
                                ],
                                type: "fragment",
                            },
                            observables: [],
                        },
                    ],
                    type: "choice-statement",
                },
            ],
            type: "fragment",
        };

        const actual = TemplateParser.parse("x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        chai.assert.deepEqual(a, e);
    }

    @shouldPass @test
    public decomposeForAndInject(): void
    {
        const template = "<span #for=\"const item of items\" #inject:value=\"source\">{source.value}</span>";

        const expected: Descriptor =
        {
            childs:
            [
                {
                    fragment:
                    {
                        childs:
                        [
                            {
                                fragment:
                                {
                                    childs:
                                    [
                                        {
                                            attributes: [],
                                            childs:
                                            [
                                                {
                                                    observables: [["source", "value"]],
                                                    type:        "text",
                                                    value:       parseExpression("`${source.value}`"),
                                                },
                                            ],
                                            tag:  "SPAN",
                                            type: "element",
                                        },
                                    ],
                                    type:   "fragment",
                                },
                                key:         parseExpression("'value'"),
                                observables: { key: [], value: [] },
                                type:        "injection-statement",
                                value:       parseDestructuredPattern("source"),
                            },
                        ],
                        type: "fragment",
                    },
                    left:        parseDestructuredPattern("item"),
                    observables: [],
                    operator:    "of",
                    right:       parseExpression("items"),
                    type:        "loop-statement",
                },
            ],
            type: "fragment",
        };

        const actual = TemplateParser.parse("x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        chai.assert.deepEqual(a, e);
    }

    @shouldPass @test
    public decompose(): void
    {
        const template = "<span class=\"foo\" #inject:value=\"source\" #if=\"true\" #placeholder:value=\"source\" #for=\"const item of items\">{source.value}</span>";

        const expected: Descriptor =
        {
            childs:
            [
                {
                    fragment:
                    {
                        childs:
                        [
                            {
                                branches:
                                [
                                    {
                                        expression: parseExpression("true"),
                                        fragment:
                                        {
                                            childs:
                                            [
                                                {
                                                    fragment:
                                                    {
                                                        childs:
                                                        [
                                                            {
                                                                fragment:
                                                                {
                                                                    childs:
                                                                    [
                                                                        {
                                                                            attributes:
                                                                            [
                                                                                {
                                                                                    key:   "class",
                                                                                    type:  "raw",
                                                                                    value: "foo",
                                                                                },
                                                                            ],
                                                                            childs:
                                                                            [
                                                                                {
                                                                                    observables: [["source", "value"]],
                                                                                    type:        "text",
                                                                                    value:       parseExpression("`${source.value}`"),
                                                                                },
                                                                            ],
                                                                            tag:  "SPAN",
                                                                            type: "element",
                                                                        },
                                                                    ],
                                                                    type:   "fragment",
                                                                },
                                                                left:        parseDestructuredPattern("item"),
                                                                observables: [],
                                                                operator:    "of",
                                                                right:       parseExpression("items"),
                                                                type:        "loop-statement",
                                                            },
                                                        ],
                                                        type:   "fragment",
                                                    },
                                                    key:         parseExpression("'value'"),
                                                    observables: { key: [], value: [] },
                                                    type:        "placeholder-statement",
                                                    value:       parseExpression("source"),
                                                },
                                            ],
                                            type: "fragment",
                                        },
                                        observables: [],
                                    },
                                ],
                                type: "choice-statement",
                            },
                        ],
                        type: "fragment",
                    },
                    key:         parseExpression("'value'"),
                    observables: { key: [], value: [] },
                    type:        "injection-statement",
                    value:       parseDestructuredPattern("source"),
                },
            ],
            type: "fragment",
        };

        const actual = TemplateParser.parse("x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        chai.assert.deepEqual(a, e);
    }

    @shouldPass @test
    public decomposePlaceholderWithPlaceholderKey(): void
    {
        const template = "<span #placeholder=\"source\" #placeholder-key=\"key\">{source.value}</span>";

        const expected: Descriptor =
        {
            childs:
            [
                {
                    fragment:
                    {
                        childs:
                        [
                            {
                                attributes: [],
                                childs:
                                [
                                    {
                                        observables: [["source", "value"]],
                                        type:        "text",
                                        value:       parseExpression("`${source.value}`"),
                                    },
                                ],
                                tag:  "SPAN",
                                type: "element",
                            },
                        ],
                        type:   "fragment",
                    },
                    key:         parseExpression("key"),
                    observables: { key: [], value: [] },
                    type:        "placeholder-statement",
                    value:       parseExpression("source"),
                },
            ],
            type: "fragment",
        };

        const actual = TemplateParser.parse("x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        chai.assert.deepEqual(a, e);
    }

    @shouldPass @test
    public decomposePlaceholderAndInject(): void
    {
        const template = "<span #placeholder:value=\"source\" #inject:value=\"source\">{source.value}</span>";

        const expected: Descriptor =
        {
            childs:
            [
                {
                    fragment:
                    {
                        childs:
                        [
                            {
                                fragment:
                                {
                                    childs:
                                    [
                                        {
                                            attributes: [],
                                            childs:
                                            [
                                                {
                                                    observables: [["source", "value"]],
                                                    type:        "text",
                                                    value:       parseExpression("`${source.value}`"),
                                                },
                                            ],
                                            tag:  "SPAN",
                                            type: "element",
                                        },
                                    ],
                                    type: "fragment",
                                },
                                key:         parseExpression("'value'"),
                                observables: { key: [], value: [] },
                                type:        "injection-statement",
                                value:       parseDestructuredPattern("source"),
                            },
                        ],
                        type:   "fragment",
                    },
                    key:         parseExpression("'value'"),
                    observables: { key: [], value: [] },
                    type:        "placeholder-statement",
                    value:       parseExpression("source"),
                },
            ],
            type: "fragment",
        };

        const actual = TemplateParser.parse("x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        chai.assert.deepEqual(a, e);
    }

    @shouldFail @test
    public ErrorParsingTextNode(): void
    {
        const template = "<div>This is a invalid expression: {++true}</div>";

        const message = "Parsing error in \"This is a invalid expression: {++true}\": Invalid left-hand side expression in prefix operation at position 33";
        const stack   = "<x-component>\n   #shadow-root\n      <div>\n         This is a invalid expression: {++true}";

        const actual   = tryAction(() => stringifyExpressions(TemplateParser.parse("x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public invalidTwoWayDataBind(): void
    {
        const template = "<x-foo ::value='host.value1 || host.value2'></x-foo>";

        const message = "Two way data bind cannot be applied to dynamic properties: \"host.value1 || host.value2\"";
        const stack   = "<x-component>\n   #shadow-root\n      <x-foo ::value=\"host.value1 || host.value2\">";

        const actual   = tryAction(() => stringifyExpressions(TemplateParser.parse("x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public invalidTwoWayDataBindWithDinamicProperty(): void
    {
        const template = "<x-foo ::value=\"host[a + b]\"></x-foo>";

        const message = "Two way data bind cannot be applied to dynamic properties: \"host[a + b]\"";
        const stack   = "<x-component>\n   #shadow-root\n      <x-foo ::value=\"host[a + b]\">";

        const actual   = tryAction(() => stringifyExpressions(TemplateParser.parse("x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public invalidTwoWayDataBindWithOptionalProperty(): void
    {
        const template = "<x-foo ::value=\"host?.value\"></x-foo>";

        const message = "Two way data bind cannot be applied to dynamic properties: \"host?.value\"";
        const stack   = "<x-component>\n   #shadow-root\n      <x-foo ::value=\"host?.value\">";

        const actual   = tryAction(() => stringifyExpressions(TemplateParser.parse("x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public errorParsingForDirective(): void
    {
        const template = "<div #inject:items='items' #if='false'><span #placeholder:items='items' #if='true' #for='x item of items'></span></div>";

        const message = "Parsing error in #for=\"x item of items\": Unexpected token item at position 2";
        const stack   = "<x-component>\n   #shadow-root\n      <div #inject:items=\"items\" #if=\"false\">\n         <span #placeholder:items=\"items\" #if=\"true\" #for=\"x item of items\">";

        const actual   = tryAction(() => stringifyExpressions(TemplateParser.parse("x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public errorParsingIfDirective(): void
    {
        const template = "<span #if='class'></span>";

        const message = "Parsing error in #if=\"class\": Unexpected token class at position 0";
        const stack   = "<x-component>\n   #shadow-root\n      <span #if=\"class\">";

        const actual   = tryAction(() => stringifyExpressions(TemplateParser.parse("x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public errorParsingElseIfDirective(): void
    {
        const template = "<span #if='true'></span><span #else-if='class'></span>";

        const message = "Parsing error in #else-if=\"class\": Unexpected token class at position 0";
        const stack   = "<x-component>\n   #shadow-root\n      ...1 other(s) node(s)\n      <span #else-if=\"class\">";

        const actual   = tryAction(() => stringifyExpressions(TemplateParser.parse("x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public unexpectedElseIf(): void
    {
        const template = "<span #if='true'></span><span #for='const item of items'></span><span #else-if></span>";

        const message = "Unexpected #else-if directive. #else-if must be used in an element next to an element that uses the #else-if directive.";
        const stack   = "<x-component>\n   #shadow-root\n      ...2 other(s) node(s)\n      <span #else-if>";

        const actual   = tryAction(() => stringifyExpressions(TemplateParser.parse("x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public unexpectedElse(): void
    {
        const template = "<span #if='true'></span><span #for='const item of items'></span><span #else></span>";

        const message = "Unexpected #else directive. #else must be used in an element next to an element that uses the #if or #else-if directive.";
        const stack   = "<x-component>\n   #shadow-root\n      ...2 other(s) node(s)\n      <span #else>";

        const actual   = tryAction(() => stringifyExpressions(TemplateParser.parse("x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }
}
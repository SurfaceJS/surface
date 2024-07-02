/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
// eslint-disable-next-line import/no-unassigned-import
import "@surface/dom-shim";

import type { Delegate, Indexer }                    from "@surface/core";
import { isIterable, resolveError }                  from "@surface/core";
import { shouldFail, shouldPass, suite, test }       from "@surface/test-suite";
import { assert }                                    from "chai";
import DescriptorType                                from "../internal/descriptor-type.js";
import TemplateParseError                            from "../internal/errors/template-parse-error.js";
import { parseDestructuredPattern, parseExpression } from "../internal/expression-parsers.js";
import SpreadFlags                                   from "../internal/flags/spread-flags.js";
import Parser                                        from "../internal/parser.js";
import type Descriptor                               from "../internal/types/descriptor.js";

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
export default class HTMLXElementParserSpec
{
    @shouldPass @test
    public parseElements(): void
    {
        const template =
        [
            " ",
            "<span></span>",
            "<span>",
            "</span>",
            "<span",
            ">",
            "</span>",
            "<span",
            ">",
            "",
            "</span>",
            "<span>",
            "\t<span>",
            "\t</span>",
            "</span>",
            " ",
        ].join("\n");

        const expected: Descriptor =
        {
            children:
            [
                {
                    attributes: [],
                    children:     [],
                    tag:        "span",
                    type:       DescriptorType.Element,
                },
                {
                    attributes: [],
                    children:     [],
                    tag:        "span",
                    type:       DescriptorType.Element,
                },
                {
                    attributes: [],
                    children:     [],
                    tag:        "span",
                    type:       DescriptorType.Element,
                },
                {
                    attributes: [],
                    children:     [],
                    tag:        "span",
                    type:       DescriptorType.Element,
                },
                {
                    attributes: [],
                    children:
                    [
                        {
                            attributes: [],
                            children:     [],
                            tag:        "span",
                            type:       DescriptorType.Element,
                        },
                    ],
                    tag:  "span",
                    type: DescriptorType.Element,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a, e);
    }

    @shouldPass @test
    public parseElementWithBinds(): void
    {
        const template = "<span foo bar=\"baz\" #show value=\"Hello {host.name}\" @click=\"host.handler\" ::value-a=\"host.value\" :value-b=\"host.x + host.y\">Some {'interpolation'} here</span>";

        const expected: Descriptor =
        {
            children:
            [
                {
                    attributes:
                    [
                        {
                            name:   "foo",
                            type:  DescriptorType.Attribute,
                            value: "",
                        },
                        {
                            name:   "bar",
                            type:  DescriptorType.Attribute,
                            value: "baz",
                        },
                        {
                            key:         "show",
                            observables: [],
                            source:      "#show",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span foo bar=\"baz\" #show value=\"Hello {host.name}\" @click=\"host.handler\" ::value-a=\"host.value\" :value-b=\"host.x + host.y\">"],
                            ],
                            type:  DescriptorType.Directive,
                            value: parseExpression("undefined"),
                        },
                        {
                            name:   "value",
                            type:  DescriptorType.Attribute,
                            value: "",
                        },
                        {
                            key:         "value",
                            observables: [["host", "name"]],
                            source:      "value=\"Hello {host.name}\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span foo bar=\"baz\" #show value=\"Hello {host.name}\" @click=\"host.handler\" ::value-a=\"host.value\" :value-b=\"host.x + host.y\">"],
                            ],
                            type:  DescriptorType.Interpolation,
                            value: parseExpression("`Hello ${host.name}`"),
                        },
                        {
                            context:    parseExpression("host"),
                            listener:   parseExpression("host.handler"),
                            name:       "click",
                            source:     "@click=\"host.handler\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span foo bar=\"baz\" #show value=\"Hello {host.name}\" @click=\"host.handler\" ::value-a=\"host.value\" :value-b=\"host.x + host.y\">"],
                            ],
                            type:  DescriptorType.EventListener,
                        },
                        {
                            left:       "valueA",
                            right:      ["host", "value"],
                            source:     "::value-a=\"host.value\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span foo bar=\"baz\" #show value=\"Hello {host.name}\" @click=\"host.handler\" ::value-a=\"host.value\" :value-b=\"host.x + host.y\">"],
                            ],
                            type: DescriptorType.TwoWay,
                        },
                        {
                            key:         "valueB",
                            observables: [["host", "x"], ["host", "y"]],
                            source:      ":value-b=\"host.x + host.y\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span foo bar=\"baz\" #show value=\"Hello {host.name}\" @click=\"host.handler\" ::value-a=\"host.value\" :value-b=\"host.x + host.y\">"],
                            ],
                            type:  DescriptorType.Oneway,
                            value: parseExpression("host.x + host.y"),
                        },
                    ],
                    children:
                    [
                        {
                            observables: [],
                            source:      "Some {'interpolation'} here",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span foo bar=\"baz\" #show value=\"Hello {host.name}\" @click=\"host.handler\" ::value-a=\"host.value\" :value-b=\"host.x + host.y\">"],
                                ["Some {'interpolation'} here"],
                            ],
                            type:  DescriptorType.TextInterpolation,
                            value: parseExpression("`Some ${'interpolation'} here`"),
                        },
                    ],
                    tag:  "span",
                    type: DescriptorType.Element,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a, e);
    }

    @shouldPass @test
    public parseElementWithListeners(): void
    {
        const template =
        [
            "<span @click=\"host.click++\" @hover=\"host.hoverHandler\" @change=\"e => host.changeHandler(e)\"></span>",
        ].join("\n");

        const expected: Descriptor =
        {
            children:
            [
                {
                    attributes:
                    [
                        {
                            context:    parseExpression("null"),
                            listener:   parseExpression("() => host.click++"),
                            name:       "click",
                            source:     "@click=\"host.click++\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span @click=\"host.click++\" @hover=\"host.hoverHandler\" @change=\"e => host.changeHandler(e)\">"],
                            ],
                            type:  DescriptorType.EventListener,
                        },
                        {
                            context:    parseExpression("host"),
                            listener:   parseExpression("host.hoverHandler"),
                            name:       "hover",
                            source:     "@hover=\"host.hoverHandler\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span @click=\"host.click++\" @hover=\"host.hoverHandler\" @change=\"e => host.changeHandler(e)\">"],
                            ],
                            type:  DescriptorType.EventListener,
                        },
                        {
                            context:    parseExpression("null"),
                            listener:   parseExpression("e => host.changeHandler(e)"),
                            name:       "change",
                            source:     "@change=\"e => host.changeHandler(e)\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span @click=\"host.click++\" @hover=\"host.hoverHandler\" @change=\"e => host.changeHandler(e)\">"],
                            ],
                            type:  DescriptorType.EventListener,
                        },
                    ],
                    children:
                    [],
                    tag:  "span",
                    type: DescriptorType.Element,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a, e);
    }

    @shouldPass @test
    public parseElementWithEmptyTextNode(): void
    {
        const template = "<span>\n\t<div> \n\tSome Indented Text\n</div>\n\t </span>";

        const expected: Descriptor =
        {
            children:
            [
                {
                    attributes: [],
                    children:
                    [
                        {
                            attributes: [],
                            children:
                            [
                                {
                                    type:  DescriptorType.Text,
                                    value: " \n\tSome Indented Text\n",
                                },
                            ],
                            tag:  "div",
                            type: DescriptorType.Element,
                        },
                    ],
                    tag:  "span",
                    type: DescriptorType.Element,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a, e);
    }

    @shouldPass @test
    public parseEmptyDirectives(): void
    {
        const template =
        [
            "<template #inject>",
            "</template>",
        ].join("\n");

        const expected: Descriptor =
        {
            children:
            [
                {
                    fragment:
                    {
                        children: [],
                        type:     DescriptorType.Fragment,
                    },
                    key:         parseExpression("'default'"),
                    observables: { key: [], scope: [] },
                    scope:       parseDestructuredPattern("{ }"),
                    source:      { key: "", scope: "#inject" },
                    stackTrace:
                    [
                        ["<x-component>"],
                        ["#shadow-root"],
                        ["<template #inject>"],
                    ],
                    type: DescriptorType.Injection,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a.children, e.children);
    }

    @shouldPass @test
    public parseInjection(): void
    {
        const template =
        [
            "<span #inject>Empty</span>",
            "<span #inject:title=\"{ title }\"><h1>{title}</h1></span>",
            "<span #inject.scope=\"{ title }\"><h1>{title}</h1></span>",
            "<span #inject.key=\"host.dynamicInjectKey\"><h1>Dynamic Content</h1></span>",
            "<span #inject.scope=\"{ title }\" #inject.key=\"host.dynamicInjectKey\"><h1>{title}</h1></span>",
        ].join("");

        const expected: Descriptor =
        {
            children:
            [
                {
                    fragment:
                    {
                        children:
                        [
                            {
                                attributes: [],
                                children:
                                [
                                    {
                                        type:  DescriptorType.Text,
                                        value: "Empty",
                                    },
                                ],
                                tag:  "span",
                                type: DescriptorType.Element,
                            },
                        ],
                        type: DescriptorType.Fragment,
                    },
                    key:          parseExpression("'default'"),
                    observables:  { key: [], scope: [] },
                    scope:       parseDestructuredPattern("{}"),
                    source:       { key: "", scope: "#inject" },
                    stackTrace:
                    [
                        ["<x-component>"],
                        ["#shadow-root"],
                        ["<span #inject>"],
                    ],
                    type: DescriptorType.Injection,
                },
                {
                    fragment:
                    {
                        children:
                        [
                            {
                                attributes: [],
                                children:
                                [
                                    {
                                        attributes: [],
                                        children:
                                        [
                                            {
                                                observables: [],
                                                source:      "{title}",
                                                stackTrace:
                                                [
                                                    ["<x-component>"],
                                                    ["#shadow-root"],
                                                    ["...1 other(s) node(s)", "<span #inject:title=\"{ title }\">"],
                                                    ["<h1>"],
                                                    ["{title}"],
                                                ],
                                                type:  DescriptorType.TextInterpolation,
                                                value: parseExpression("`${title}`"),
                                            },
                                        ],
                                        tag:  "h1",
                                        type: DescriptorType.Element,
                                    },
                                ],
                                tag:  "span",
                                type: DescriptorType.Element,
                            },
                        ],
                        type: DescriptorType.Fragment,
                    },
                    key:         parseExpression("'title'"),
                    observables: { key: [], scope: [] },
                    scope:       parseDestructuredPattern("{ title }"),
                    source:      { key: "", scope: "#inject:title=\"{ title }\"" },
                    stackTrace:
                    [
                        ["<x-component>"],
                        ["#shadow-root"],
                        ["...1 other(s) node(s)", "<span #inject:title=\"{ title }\">"],
                    ],
                    type:  DescriptorType.Injection,
                },
                {
                    fragment:
                    {
                        children:
                        [
                            {
                                attributes: [],
                                children:
                                [
                                    {
                                        attributes: [],
                                        children:
                                        [
                                            {
                                                observables: [],
                                                source:      "{title}",
                                                stackTrace:
                                                [
                                                    ["<x-component>"],
                                                    ["#shadow-root"],
                                                    ["...2 other(s) node(s)", "<span #inject.scope=\"{ title }\">"],
                                                    ["<h1>"],
                                                    ["{title}"],
                                                ],
                                                type:  DescriptorType.TextInterpolation,
                                                value: parseExpression("`${title}`"),
                                            },
                                        ],
                                        tag:  "h1",
                                        type: DescriptorType.Element,
                                    },
                                ],
                                tag:  "span",
                                type: DescriptorType.Element,
                            },
                        ],
                        type: DescriptorType.Fragment,
                    },
                    key:         parseExpression("'default'"),
                    observables: { key: [], scope: [] },
                    scope:       parseDestructuredPattern("{ title }"),
                    source:      { key: "", scope: "#inject.scope=\"{ title }\"" },
                    stackTrace:
                    [
                        ["<x-component>"],
                        ["#shadow-root"],
                        ["...2 other(s) node(s)", "<span #inject.scope=\"{ title }\">"],
                    ],
                    type:  DescriptorType.Injection,
                },
                {
                    fragment:
                    {
                        children:
                        [
                            {
                                attributes: [],
                                children:
                                [
                                    {
                                        attributes: [],
                                        children:
                                        [
                                            {
                                                type:  DescriptorType.Text,
                                                value: "Dynamic Content",
                                            },
                                        ],
                                        tag:  "h1",
                                        type: DescriptorType.Element,
                                    },
                                ],
                                tag:  "span",
                                type: DescriptorType.Element,
                            },
                        ],
                        type: DescriptorType.Fragment,
                    },
                    key:         parseExpression("host.dynamicInjectKey"),
                    observables: { key: [["host", "dynamicInjectKey"]], scope: [] },
                    scope:       parseDestructuredPattern("{ }"),
                    source:      { key: "#inject.key=\"host.dynamicInjectKey\"", scope: "" },
                    stackTrace:
                    [
                        ["<x-component>"],
                        ["#shadow-root"],
                        ["...3 other(s) node(s)", "<span #inject.key=\"host.dynamicInjectKey\">"],
                    ],
                    type:  DescriptorType.Injection,
                },
                {
                    fragment:
                    {
                        children:
                        [
                            {
                                attributes: [],
                                children:
                                [
                                    {
                                        attributes: [],
                                        children:
                                        [
                                            {
                                                observables: [],
                                                source:      "{title}",
                                                stackTrace:
                                                [
                                                    ["<x-component>"],
                                                    ["#shadow-root"],
                                                    ["...4 other(s) node(s)", "<span #inject.scope=\"{ title }\" #inject.key=\"host.dynamicInjectKey\">"],
                                                    ["<h1>"],
                                                    ["{title}"],
                                                ],
                                                type:  DescriptorType.TextInterpolation,
                                                value: parseExpression("`${title}`"),
                                            },
                                        ],
                                        tag:  "h1",
                                        type: DescriptorType.Element,
                                    },
                                ],
                                tag:  "span",
                                type: DescriptorType.Element,
                            },
                        ],
                        type: DescriptorType.Fragment,
                    },
                    key:         parseExpression("host.dynamicInjectKey"),
                    observables: { key: [["host", "dynamicInjectKey"]], scope: [] },
                    scope:       parseDestructuredPattern("{ title }"),
                    source:      { key: "#inject.key=\"host.dynamicInjectKey\"", scope: "#inject.scope=\"{ title }\"" },
                    stackTrace:
                    [
                        ["<x-component>"],
                        ["#shadow-root"],
                        ["...4 other(s) node(s)", "<span #inject.scope=\"{ title }\" #inject.key=\"host.dynamicInjectKey\">"],
                    ],
                    type:  DescriptorType.Injection,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a.children, e.children);
    }

    @shouldPass @test
    public parseChoice(): void
    {
        const template =
        [
            "<span #if=\"host.status == 1\">Active</span>",
            "<!--Will be ignored-->",
            "<span #else-if=\"host.status == 2\">Waiting</span>",
            "Will be ignored and show warning",
            "<span #else>Suspended</span>",
        ].join("");

        const expected: Descriptor =
        {
            children:
            [
                {
                    branches:
                    [
                        {
                            expression:  parseExpression("host.status == 1"),
                            fragment:
                            {
                                children:
                                [
                                    {
                                        attributes: [],
                                        children:
                                        [
                                            {
                                                type:  DescriptorType.Text,
                                                value: "Active",
                                            },
                                        ],
                                        tag:  "span",
                                        type: DescriptorType.Element,
                                    },
                                ],
                                type: DescriptorType.Fragment,
                            },
                            observables: [["host", "status"]],
                            source:      "#if=\"host.status == 1\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span #if=\"host.status == 1\">"],
                            ],
                        },
                        {
                            expression:  parseExpression("host.status == 2"),
                            fragment:
                            {
                                children:
                                [
                                    {
                                        attributes: [],
                                        children:
                                        [
                                            {
                                                type:  DescriptorType.Text,
                                                value: "Waiting",
                                            },
                                        ],
                                        tag:  "span",
                                        type: DescriptorType.Element,
                                    },
                                ],
                                type: DescriptorType.Fragment,
                            },
                            observables: [["host", "status"]],
                            source:      "#else-if=\"host.status == 2\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["...1 other(s) node(s)", "<span #else-if=\"host.status == 2\">"],
                            ],
                        },
                        {
                            expression:  parseExpression("true"),
                            fragment:
                            {
                                children:
                                [
                                    {
                                        attributes: [],
                                        children:
                                        [
                                            {
                                                type:  DescriptorType.Text,
                                                value: "Suspended",
                                            },
                                        ],
                                        tag:  "span",
                                        type: DescriptorType.Element,
                                    },
                                ],
                                type: DescriptorType.Fragment,
                            },
                            observables: [],
                            source:      "#else",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["...2 other(s) node(s)", "<span #else>"],
                            ],
                        },
                    ],
                    type: DescriptorType.Choice,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a, e);
    }

    @shouldPass @test
    public parsePlaceholder(): void
    {
        const template =
        [
            "<span #placeholder>Default Empty</span>",
            "<span #placeholder:value=\"{ name: host.name }\">Default {name}</span>",
            "<span #placeholder.scope=\"{ name: host.name }\">Default {name}</span>",
            "<span #placeholder.key=\"host.dynamicPlaceholderKey\">Dynamic Content</span>",
            "<span #placeholder.key=\"host.dynamicPlaceholderKey\" #placeholder.scope=\"{ name: host.name }\">Default {name}</span>",
        ].join("");

        const expected: Descriptor =
        {
            children:
            [
                {
                    fragment:
                    {
                        children:
                        [
                            {
                                attributes: [],
                                children:
                                [
                                    {
                                        type:  DescriptorType.Text,
                                        value: "Default Empty",
                                    },
                                ],
                                tag:  "span",
                                type: DescriptorType.Element,
                            },
                        ],
                        type:   DescriptorType.Fragment,
                    },
                    key:         parseExpression("'default'"),
                    observables: { key: [], scope: [] },
                    scope:       parseExpression("{ }"),
                    source:      { key: "", scope: "#placeholder" },
                    stackTrace:
                    [
                        ["<x-component>"],
                        ["#shadow-root"],
                        ["<span #placeholder>"],
                    ],
                    type:  DescriptorType.Placeholder,
                },
                {
                    fragment:
                    {
                        children:
                        [
                            {
                                attributes: [],
                                children:
                                [
                                    {
                                        observables: [],
                                        source:      "Default {name}",
                                        stackTrace:
                                        [
                                            ["<x-component>"],
                                            ["#shadow-root"],
                                            ["...1 other(s) node(s)", "<span #placeholder:value=\"{ name: host.name }\">"],
                                            ["Default {name}"],
                                        ],
                                        type:  DescriptorType.TextInterpolation,
                                        value: parseExpression("`Default ${name}`"),
                                    },
                                ],
                                tag:  "span",
                                type: DescriptorType.Element,
                            },
                        ],
                        type:   DescriptorType.Fragment,
                    },
                    key:         parseExpression("'value'"),
                    observables: { key: [], scope: [["host", "name"]] },
                    scope:       parseExpression("{ name: host.name }"),
                    source:      { key: "", scope: "#placeholder:value=\"{ name: host.name }\"" },
                    stackTrace:
                    [
                        ["<x-component>"],
                        ["#shadow-root"],
                        ["...1 other(s) node(s)", "<span #placeholder:value=\"{ name: host.name }\">"],
                    ],
                    type: DescriptorType.Placeholder,
                },
                {
                    fragment:
                    {
                        children:
                        [
                            {
                                attributes: [],
                                children:
                                [
                                    {
                                        observables: [],
                                        source:      "Default {name}",
                                        stackTrace:
                                        [
                                            ["<x-component>"],
                                            ["#shadow-root"],
                                            ["...2 other(s) node(s)", "<span #placeholder.scope=\"{ name: host.name }\">"],
                                            ["Default {name}"],
                                        ],
                                        type:  DescriptorType.TextInterpolation,
                                        value: parseExpression("`Default ${name}`"),
                                    },
                                ],
                                tag:  "span",
                                type: DescriptorType.Element,
                            },
                        ],
                        type:   DescriptorType.Fragment,
                    },
                    key:         parseExpression("'default'"),
                    observables: { key: [], scope: [["host", "name"]] },
                    scope:       parseExpression("{ name: host.name }"),
                    source:      { key: "", scope: "#placeholder.scope=\"{ name: host.name }\"" },
                    stackTrace:
                    [
                        ["<x-component>"],
                        ["#shadow-root"],
                        ["...2 other(s) node(s)", "<span #placeholder.scope=\"{ name: host.name }\">"],
                    ],
                    type: DescriptorType.Placeholder,
                },
                {
                    fragment:
                    {
                        children:
                        [
                            {
                                attributes: [],
                                children:
                                [
                                    {
                                        type:  DescriptorType.Text,
                                        value: "Dynamic Content",
                                    },
                                ],
                                tag:  "span",
                                type: DescriptorType.Element,
                            },
                        ],
                        type:   DescriptorType.Fragment,
                    },
                    key:         parseExpression("host.dynamicPlaceholderKey"),
                    observables: { key: [["host", "dynamicPlaceholderKey"]], scope: [] },
                    scope:       parseExpression("{ }"),
                    source:      { key: "#placeholder.key=\"host.dynamicPlaceholderKey\"", scope: "" },
                    stackTrace:
                    [
                        ["<x-component>"],
                        ["#shadow-root"],
                        ["...3 other(s) node(s)", "<span #placeholder.key=\"host.dynamicPlaceholderKey\">"],
                    ],
                    type:  DescriptorType.Placeholder,
                },
                {
                    fragment:
                    {
                        children:
                        [
                            {
                                attributes: [],
                                children:
                                [
                                    {
                                        observables: [],
                                        source:      "Default {name}",
                                        stackTrace:
                                        [
                                            ["<x-component>"],
                                            ["#shadow-root"],
                                            ["...4 other(s) node(s)", "<span #placeholder.key=\"host.dynamicPlaceholderKey\" #placeholder.scope=\"{ name: host.name }\">"],
                                            ["Default {name}"],
                                        ],
                                        type:  DescriptorType.TextInterpolation,
                                        value: parseExpression("`Default ${name}`"),
                                    },
                                ],
                                tag:  "span",
                                type: DescriptorType.Element,
                            },
                        ],
                        type: DescriptorType.Fragment,
                    },
                    key:         parseExpression("host.dynamicPlaceholderKey"),
                    observables: { key: [["host", "dynamicPlaceholderKey"]], scope: [["host", "name"]] },
                    scope:       parseExpression("{ name: host.name }"),
                    source:      { key: "#placeholder.key=\"host.dynamicPlaceholderKey\"", scope: "#placeholder.scope=\"{ name: host.name }\"" },
                    stackTrace:
                    [
                        ["<x-component>"],
                        ["#shadow-root"],
                        ["...4 other(s) node(s)", "<span #placeholder.key=\"host.dynamicPlaceholderKey\" #placeholder.scope=\"{ name: host.name }\">"],
                    ],
                    type:  DescriptorType.Placeholder,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a, e);
    }

    @shouldPass @test
    public parseLoop(): void
    {
        const template =
        [
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
        ].join("");

        const expected: Descriptor =
        {
            children:
            [
                {
                    attributes: [],
                    children:
                    [
                        {
                            attributes: [],
                            children:
                            [
                                {
                                    attributes: [],
                                    children:
                                    [
                                        {
                                            attributes: [],
                                            children:
                                            [
                                                {
                                                    type:  DescriptorType.Text,
                                                    value: "Id",
                                                },
                                            ],
                                            tag:  "th",
                                            type: DescriptorType.Element,
                                        },
                                        {
                                            attributes: [],
                                            children:
                                            [
                                                {
                                                    type:  DescriptorType.Text,
                                                    value: "Name",
                                                },
                                            ],
                                            tag:  "th",
                                            type: DescriptorType.Element,
                                        },
                                        {
                                            attributes: [],
                                            children:
                                            [
                                                {
                                                    type:  DescriptorType.Text,
                                                    value: "Status",
                                                },
                                            ],
                                            tag:  "th",
                                            type: DescriptorType.Element,
                                        },
                                    ],
                                    tag:  "tr",
                                    type: DescriptorType.Element,
                                },
                                {
                                    fragment:
                                    {
                                        children:
                                        [
                                            {
                                                attributes: [{ name: "onclick", type: DescriptorType.Attribute, value: "fn({ clicked })" }],
                                                children:
                                                [
                                                    {
                                                        attributes: [],
                                                        children:
                                                        [
                                                            {
                                                                observables: [["item", "id"]],
                                                                source:      "{item.id}",
                                                                stackTrace:
                                                                [
                                                                    ["<x-component>"],
                                                                    ["#shadow-root"],
                                                                    ["<table>"],
                                                                    ["<tbody>"],
                                                                    ["...1 other(s) node(s)", "<tr onclick=\"fn({ clicked })\" #for=\"const item of host.items\">"],
                                                                    ["<td>"],
                                                                    ["{item.id}"],
                                                                ],
                                                                type:  DescriptorType.TextInterpolation,
                                                                value: parseExpression("`${item.id}`"),
                                                            },
                                                        ],
                                                        tag:  "td",
                                                        type: DescriptorType.Element,
                                                    },
                                                    {
                                                        attributes: [],
                                                        children:
                                                        [
                                                            {
                                                                observables: [["item", "name"]],
                                                                source:      "{item.name}",
                                                                stackTrace:
                                                                [
                                                                    ["<x-component>"],
                                                                    ["#shadow-root"],
                                                                    ["<table>"],
                                                                    ["<tbody>"],
                                                                    ["...1 other(s) node(s)", "<tr onclick=\"fn({ clicked })\" #for=\"const item of host.items\">"],
                                                                    ["...1 other(s) node(s)", "<td>"],
                                                                    ["{item.name}"],
                                                                ],
                                                                type:  DescriptorType.TextInterpolation,
                                                                value: parseExpression("`${item.name}`"),
                                                            },
                                                        ],
                                                        tag:  "td",
                                                        type: DescriptorType.Element,
                                                    },
                                                    {
                                                        attributes: [],
                                                        children:
                                                        [
                                                            {
                                                                observables: [["item", "status"]],
                                                                source:      "{item.status}",
                                                                stackTrace:
                                                                [
                                                                    ["<x-component>"],
                                                                    ["#shadow-root"],
                                                                    ["<table>"],
                                                                    ["<tbody>"],
                                                                    ["...1 other(s) node(s)", "<tr onclick=\"fn({ clicked })\" #for=\"const item of host.items\">"],
                                                                    ["...2 other(s) node(s)", "<td>"],
                                                                    ["{item.status}"],
                                                                ],
                                                                type:  DescriptorType.TextInterpolation,
                                                                value: parseExpression("`${item.status}`"),
                                                            },
                                                        ],
                                                        tag:  "td",
                                                        type: DescriptorType.Element,
                                                    },
                                                ],
                                                tag:  "tr",
                                                type: DescriptorType.Element,
                                            },
                                        ],
                                        type: DescriptorType.Fragment,
                                    },
                                    left:        parseDestructuredPattern("item"),
                                    observables: [["host", "items"]],
                                    operator:    "of",
                                    right:       parseExpression("host.items"),
                                    source:      "#for=\"const item of host.items\"",
                                    stackTrace:
                                    [
                                        ["<x-component>"],
                                        ["#shadow-root"],
                                        ["<table>"],
                                        ["<tbody>"],
                                        ["...1 other(s) node(s)", "<tr onclick=\"fn({ clicked })\" #for=\"const item of host.items\">"],
                                    ],
                                    type: DescriptorType.Loop,
                                },
                            ],
                            tag:  "tbody",
                            type: DescriptorType.Element,
                        },
                    ],
                    tag:  "table",
                    type: DescriptorType.Element,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a, e);
    }

    @shouldPass @test
    public parseElementWithSpread(): void
    {
        const template =
        [
            "<div ...attributes|properties|listeners=\"host\"></div>",
            "<div ...attributes=\"host\" ...properties=\"host\" ...listeners=\"host\"></div>",
        ].join("");

        const expected: Descriptor =
        {
            children:
            [
                {
                    attributes:
                    [
                        {
                            expression:  parseExpression("host"),
                            flags:       SpreadFlags.Attributes | SpreadFlags.Properties | SpreadFlags.Listeners,
                            observables: [],
                            source:      "...attributes|properties|listeners=\"host\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<div ...attributes|properties|listeners=\"host\">"],
                            ],
                            type: DescriptorType.Spread,
                        },
                    ],
                    children: [],
                    tag:      "div",
                    type:     DescriptorType.Element,
                },
                {
                    attributes:
                    [
                        {
                            expression:  parseExpression("host"),
                            flags:       SpreadFlags.Attributes,
                            observables: [],
                            source:      "...attributes=\"host\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["...1 other(s) node(s)", "<div ...attributes=\"host\" ...properties=\"host\" ...listeners=\"host\">"],
                            ],
                            type: DescriptorType.Spread,
                        },
                        {
                            expression:  parseExpression("host"),
                            flags:       SpreadFlags.Properties,
                            observables: [],
                            source:      "...properties=\"host\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["...1 other(s) node(s)", "<div ...attributes=\"host\" ...properties=\"host\" ...listeners=\"host\">"],
                            ],
                            type: DescriptorType.Spread,
                        },
                        {
                            expression:  parseExpression("host"),
                            flags:       SpreadFlags.Listeners,
                            observables: [],
                            source:      "...listeners=\"host\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["...1 other(s) node(s)", "<div ...attributes=\"host\" ...properties=\"host\" ...listeners=\"host\">"],
                            ],
                            type: DescriptorType.Spread,
                        },
                    ],
                    children: [],
                    tag:      "div",
                    type:     DescriptorType.Element,
                },
            ],
            type:   DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a.children, e.children);
    }

    @shouldPass @test
    public parseStatic(): void
    {
        const template =
        [
            "<hr>",
            "<script>console.log({ window });</script>",
            "<style rel=\"stylesheet\" href=\"./styles.css\"></style>",
            "<style>h1 { color: red }</style>",
            "<!--This is a comment-->",
        ].join("");

        const expected: Descriptor =
        {
            children:
            [
                {
                    attributes: [],
                    children:     [],
                    tag:        "hr",
                    type:       DescriptorType.Element,
                },
                {
                    attributes: [],
                    children:
                    [
                        {
                            type:  DescriptorType.Text,
                            value: "console.log({ window });",
                        },
                    ],
                    tag:  "script",
                    type: DescriptorType.Element,
                },
                {
                    attributes:
                    [
                        { name: "rel",  type: DescriptorType.Attribute, value: "stylesheet" },
                        { name: "href", type: DescriptorType.Attribute, value: "./styles.css" },
                    ],
                    children: [],
                    tag:      "style",
                    type:     DescriptorType.Element,
                },
                {
                    attributes: [],
                    children:
                    [
                        {
                            type:  DescriptorType.Text,
                            value: "h1 { color: red }",
                        },
                    ],
                    tag:  "style",
                    type: DescriptorType.Element,
                },
                {
                    type:  DescriptorType.Comment,
                    value: "This is a comment",
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a, e);
    }

    @shouldPass @test
    public decomposeIfAndFor(): void
    {
        const template = "<span #if=\"true\" #for=\"const item of items\">{item.value}</span>";

        const expected: Descriptor =
        {
            children:
            [
                {
                    branches:
                    [
                        {
                            expression: parseExpression("true"),
                            fragment:
                            {
                                children:
                                [
                                    {
                                        fragment:
                                        {
                                            children:
                                            [
                                                {
                                                    attributes: [],
                                                    children:
                                                    [
                                                        {
                                                            observables: [["item", "value"]],
                                                            source:      "{item.value}",
                                                            stackTrace:
                                                            [
                                                                ["<x-component>"],
                                                                ["#shadow-root"],
                                                                ["<span #if=\"true\" #for=\"const item of items\">"],
                                                                ["{item.value}"],
                                                            ],
                                                            type:  DescriptorType.TextInterpolation,
                                                            value: parseExpression("`${item.value}`"),
                                                        },
                                                    ],
                                                    tag:  "span",
                                                    type: DescriptorType.Element,
                                                },
                                            ],
                                            type:   DescriptorType.Fragment,
                                        },
                                        left:        parseDestructuredPattern("item"),
                                        observables: [],
                                        operator:    "of",
                                        right:       parseExpression("items"),
                                        source:      "#for=\"const item of items\"",
                                        stackTrace:
                                        [
                                            ["<x-component>"],
                                            ["#shadow-root"],
                                            ["<span #if=\"true\" #for=\"const item of items\">"],
                                        ],
                                        type: DescriptorType.Loop,
                                    },
                                ],
                                type: DescriptorType.Fragment,
                            },
                            observables: [],
                            source:      "#if=\"true\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span #if=\"true\" #for=\"const item of items\">"],
                            ],
                        },
                    ],
                    type: DescriptorType.Choice,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a, e);
    }

    @shouldPass @test
    public decomposeIfAndPlaceholder(): void
    {
        const template = "<span #if=\"true\" #placeholder:value=\"source\">Placeholder</span>";

        const expected: Descriptor =
        {
            children:
            [
                {
                    branches:
                    [
                        {
                            expression: parseExpression("true"),
                            fragment:
                            {
                                children:
                                [
                                    {
                                        fragment:
                                        {
                                            children:
                                            [
                                                {
                                                    attributes: [],
                                                    children:
                                                    [
                                                        {
                                                            type:  DescriptorType.Text,
                                                            value: "Placeholder",
                                                        },
                                                    ],
                                                    tag:  "span",
                                                    type: DescriptorType.Element,
                                                },
                                            ],
                                            type:   DescriptorType.Fragment,
                                        },
                                        key:         parseExpression("'value'"),
                                        observables: { key: [], scope: [] },
                                        scope:       parseExpression("source"),
                                        source:      { key: "", scope: "#placeholder:value=\"source\"" },
                                        stackTrace:
                                        [
                                            ["<x-component>"],
                                            ["#shadow-root"],
                                            ["<span #if=\"true\" #placeholder:value=\"source\">"],
                                        ],
                                        type: DescriptorType.Placeholder,
                                    },
                                ],
                                type: DescriptorType.Fragment,
                            },
                            observables: [],
                            source:      "#if=\"true\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span #if=\"true\" #placeholder:value=\"source\">"],
                            ],
                        },
                    ],
                    type: DescriptorType.Choice,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a, e);
    }

    @shouldPass @test
    public decomposeForAndPlaceholder(): void
    {
        const template = "<span #for=\"const [key, value] of items\" #placeholder.key=\"key\" #placeholder.scope=\"source\">{source.value}</span>";

        const expected: Descriptor =
        {
            children:
            [
                {
                    fragment:
                    {
                        children:
                        [
                            {
                                fragment:
                                {
                                    children:
                                    [
                                        {
                                            attributes: [],
                                            children:
                                            [
                                                {
                                                    observables: [["source", "value"]],
                                                    source:      "{source.value}",
                                                    stackTrace:
                                                    [
                                                        ["<x-component>"],
                                                        ["#shadow-root"],
                                                        ["<span #for=\"const [key, value] of items\" #placeholder.key=\"key\" #placeholder.scope=\"source\">"],
                                                        ["{source.value}"],
                                                    ],
                                                    type:  DescriptorType.TextInterpolation,
                                                    value: parseExpression("`${source.value}`"),
                                                },
                                            ],
                                            tag:  "span",
                                            type: DescriptorType.Element,
                                        },
                                    ],
                                    type: DescriptorType.Fragment,
                                },
                                key:         parseExpression("key"),
                                observables: { key: [], scope: [] },
                                scope:       parseExpression("source"),
                                source:      { key: "#placeholder.key=\"key\"", scope: "#placeholder.scope=\"source\"" },
                                stackTrace:
                                [
                                    ["<x-component>"],
                                    ["#shadow-root"],
                                    ["<span #for=\"const [key, value] of items\" #placeholder.key=\"key\" #placeholder.scope=\"source\">"],
                                ],
                                type:  DescriptorType.Placeholder,
                            },
                        ],
                        type: DescriptorType.Fragment,
                    },
                    left:        parseDestructuredPattern("[key, value]"),
                    observables: [],
                    operator:    "of",
                    right:       parseExpression("items"),
                    source:      "#for=\"const [key, value] of items\"",
                    stackTrace:
                    [
                        ["<x-component>"],
                        ["#shadow-root"],
                        ["<span #for=\"const [key, value] of items\" #placeholder.key=\"key\" #placeholder.scope=\"source\">"],
                    ],
                    type: DescriptorType.Loop,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a, e);
    }

    @shouldPass @test
    public decomposeIfAndInject(): void
    {
        const template = "<span #if=\"true\" #inject:value=\"source\">{source.value}</span>";

        const expected: Descriptor =
        {
            children:
            [
                {
                    branches:
                    [
                        {
                            expression: parseExpression("true"),
                            fragment:
                            {
                                children:
                                [
                                    {
                                        fragment:
                                        {
                                            children:
                                            [
                                                {
                                                    attributes: [],
                                                    children:
                                                    [
                                                        {
                                                            observables: [["source", "value"]],
                                                            source:      "{source.value}",
                                                            stackTrace:
                                                            [
                                                                ["<x-component>"],
                                                                ["#shadow-root"],
                                                                ["<span #if=\"true\" #inject:value=\"source\">"],
                                                                ["{source.value}"],
                                                            ],
                                                            type:  DescriptorType.TextInterpolation,
                                                            value: parseExpression("`${source.value}`"),
                                                        },
                                                    ],
                                                    tag:  "span",
                                                    type: DescriptorType.Element,
                                                },
                                            ],
                                            type:   DescriptorType.Fragment,
                                        },
                                        key:         parseExpression("'value'"),
                                        observables: { key: [], scope: [] },
                                        scope:       parseDestructuredPattern("source"),
                                        source:      { key: "", scope: "#inject:value=\"source\"" },
                                        stackTrace:
                                        [
                                            ["<x-component>"],
                                            ["#shadow-root"],
                                            ["<span #if=\"true\" #inject:value=\"source\">"],
                                        ],
                                        type:        DescriptorType.Injection,
                                    },
                                ],
                                type: DescriptorType.Fragment,
                            },
                            observables: [],
                            source:      "#if=\"true\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span #if=\"true\" #inject:value=\"source\">"],
                            ],
                        },
                    ],
                    type: DescriptorType.Choice,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a, e);
    }

    @shouldPass @test
    public decomposeForAndInject(): void
    {
        const template = "<span #for=\"const item of items\" #inject:value=\"source\">{source.value}</span>";

        const expected: Descriptor =
        {
            children:
            [
                {
                    fragment:
                    {
                        children:
                        [
                            {
                                fragment:
                                {
                                    children:
                                    [
                                        {
                                            attributes: [],
                                            children:
                                            [
                                                {
                                                    observables: [["source", "value"]],
                                                    source:      "{source.value}",
                                                    stackTrace:
                                                    [
                                                        ["<x-component>"],
                                                        ["#shadow-root"],
                                                        ["<span #for=\"const item of items\" #inject:value=\"source\">"],
                                                        ["{source.value}"],
                                                    ],
                                                    type:  DescriptorType.TextInterpolation,
                                                    value: parseExpression("`${source.value}`"),
                                                },
                                            ],
                                            tag:  "span",
                                            type: DescriptorType.Element,
                                        },
                                    ],
                                    type:   DescriptorType.Fragment,
                                },
                                key:         parseExpression("'value'"),
                                observables: { key: [], scope: [] },
                                scope:       parseDestructuredPattern("source"),
                                source:      { key: "", scope: "#inject:value=\"source\"" },
                                stackTrace:
                                [
                                    ["<x-component>"],
                                    ["#shadow-root"],
                                    ["<span #for=\"const item of items\" #inject:value=\"source\">"],
                                ],
                                type:  DescriptorType.Injection,
                            },
                        ],
                        type: DescriptorType.Fragment,
                    },
                    left:        parseDestructuredPattern("item"),
                    observables: [],
                    operator:    "of",
                    right:       parseExpression("items"),
                    source:      "#for=\"const item of items\"",
                    stackTrace:
                    [
                        ["<x-component>"],
                        ["#shadow-root"],
                        ["<span #for=\"const item of items\" #inject:value=\"source\">"],
                    ],
                    type: DescriptorType.Loop,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a, e);
    }

    @shouldPass @test
    public decompose(): void
    {
        const template = "<span class=\"foo\" #inject:value=\"source\" #if=\"true\" #placeholder:value=\"source\" #for=\"const item of items\">{source.value}</span>";

        const expected: Descriptor =
        {
            children:
            [
                {
                    fragment:
                    {
                        children:
                        [
                            {
                                branches:
                                [
                                    {
                                        expression: parseExpression("true"),
                                        fragment:
                                        {
                                            children:
                                            [
                                                {
                                                    fragment:
                                                    {
                                                        children:
                                                        [
                                                            {
                                                                fragment:
                                                                {
                                                                    children:
                                                                    [
                                                                        {
                                                                            attributes:
                                                                            [
                                                                                {
                                                                                    name:   "class",
                                                                                    type:  DescriptorType.Attribute,
                                                                                    value: "foo",
                                                                                },
                                                                            ],
                                                                            children:
                                                                            [
                                                                                {
                                                                                    observables: [["source", "value"]],
                                                                                    source:      "{source.value}",
                                                                                    stackTrace:
                                                                                    [
                                                                                        ["<x-component>"],
                                                                                        ["#shadow-root"],
                                                                                        ["<span class=\"foo\" #inject:value=\"source\" #if=\"true\" #placeholder:value=\"source\" #for=\"const item of items\">"],
                                                                                        ["{source.value}"],
                                                                                    ],
                                                                                    type:  DescriptorType.TextInterpolation,
                                                                                    value: parseExpression("`${source.value}`"),
                                                                                },
                                                                            ],
                                                                            tag:  "span",
                                                                            type: DescriptorType.Element,
                                                                        },
                                                                    ],
                                                                    type:   DescriptorType.Fragment,
                                                                },
                                                                left:        parseDestructuredPattern("item"),
                                                                observables: [],
                                                                operator:    "of",
                                                                right:       parseExpression("items"),
                                                                source:      "#for=\"const item of items\"",
                                                                stackTrace:
                                                                [
                                                                    ["<x-component>"],
                                                                    ["#shadow-root"],
                                                                    ["<span class=\"foo\" #inject:value=\"source\" #if=\"true\" #placeholder:value=\"source\" #for=\"const item of items\">"],
                                                                ],
                                                                type: DescriptorType.Loop,
                                                            },
                                                        ],
                                                        type: DescriptorType.Fragment,
                                                    },
                                                    key:         parseExpression("'value'"),
                                                    observables: { key: [], scope: [] },
                                                    scope:       parseExpression("source"),
                                                    source:      { key: "", scope: "#placeholder:value=\"source\"" },
                                                    stackTrace:
                                                    [
                                                        ["<x-component>"],
                                                        ["#shadow-root"],
                                                        ["<span class=\"foo\" #inject:value=\"source\" #if=\"true\" #placeholder:value=\"source\" #for=\"const item of items\">"],
                                                    ],
                                                    type:  DescriptorType.Placeholder,
                                                },
                                            ],
                                            type: DescriptorType.Fragment,
                                        },
                                        observables: [],
                                        source:      "#if=\"true\"",
                                        stackTrace:
                                        [
                                            ["<x-component>"],
                                            ["#shadow-root"],
                                            ["<span class=\"foo\" #inject:value=\"source\" #if=\"true\" #placeholder:value=\"source\" #for=\"const item of items\">"],
                                        ],
                                    },
                                ],
                                type: DescriptorType.Choice,
                            },
                        ],
                        type: DescriptorType.Fragment,
                    },
                    key:         parseExpression("'value'"),
                    observables: { key: [], scope: [] },
                    scope:       parseDestructuredPattern("source"),
                    source:      { key: "", scope: "#inject:value=\"source\"" },
                    stackTrace:
                    [
                        ["<x-component>"],
                        ["#shadow-root"],
                        ["<span class=\"foo\" #inject:value=\"source\" #if=\"true\" #placeholder:value=\"source\" #for=\"const item of items\">"],
                    ],
                    type:  DescriptorType.Injection,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a, e);
    }

    @shouldPass @test
    public decomposePlaceholderWithPlaceholderKey(): void
    {
        const template = "<span #placeholder.key=\"key\" #placeholder.scope=\"source\">{source.value}</span>";

        const expected: Descriptor =
        {
            children:
            [
                {
                    fragment:
                    {
                        children:
                        [
                            {
                                attributes: [],
                                children:
                                [
                                    {
                                        observables: [["source", "value"]],
                                        source:      "{source.value}",
                                        stackTrace:
                                        [
                                            ["<x-component>"],
                                            ["#shadow-root"],
                                            ["<span #placeholder.key=\"key\" #placeholder.scope=\"source\">"],
                                            ["{source.value}"],
                                        ],
                                        type:  DescriptorType.TextInterpolation,
                                        value: parseExpression("`${source.value}`"),
                                    },
                                ],
                                tag:  "span",
                                type: DescriptorType.Element,
                            },
                        ],
                        type:   DescriptorType.Fragment,
                    },
                    key:         parseExpression("key"),
                    observables: { key: [], scope: [] },
                    scope:       parseExpression("source"),
                    source:      { key: "#placeholder.key=\"key\"", scope: "#placeholder.scope=\"source\"" },
                    stackTrace:
                    [
                        ["<x-component>"],
                        ["#shadow-root"],
                        ["<span #placeholder.key=\"key\" #placeholder.scope=\"source\">"],
                    ],
                    type:  DescriptorType.Placeholder,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a, e);
    }

    @shouldPass @test
    public decomposePlaceholderAndInject(): void
    {
        const template = "<span #placeholder:value=\"source\" #inject:value=\"source\">{source.value}</span>";

        const expected: Descriptor =
        {
            children:
            [
                {
                    fragment:
                    {
                        children:
                        [
                            {
                                fragment:
                                {
                                    children:
                                    [
                                        {
                                            attributes: [],
                                            children:
                                            [
                                                {
                                                    observables: [["source", "value"]],
                                                    source:      "{source.value}",
                                                    stackTrace:
                                                    [
                                                        ["<x-component>"],
                                                        ["#shadow-root"],
                                                        ["<span #placeholder:value=\"source\" #inject:value=\"source\">"],
                                                        ["{source.value}"],
                                                    ],
                                                    type:  DescriptorType.TextInterpolation,
                                                    value: parseExpression("`${source.value}`"),
                                                },
                                            ],
                                            tag:  "span",
                                            type: DescriptorType.Element,
                                        },
                                    ],
                                    type: DescriptorType.Fragment,
                                },
                                key:         parseExpression("'value'"),
                                observables: { key: [], scope: [] },
                                scope:       parseDestructuredPattern("source"),
                                source:      { key: "", scope: "#inject:value=\"source\"" },
                                stackTrace:
                                [
                                    ["<x-component>"],
                                    ["#shadow-root"],
                                    ["<span #placeholder:value=\"source\" #inject:value=\"source\">"],
                                ],
                                type: DescriptorType.Injection,
                            },
                        ],
                        type:   DescriptorType.Fragment,
                    },
                    key:         parseExpression("'value'"),
                    observables: { key: [], scope: [] },
                    scope:       parseExpression("source"),
                    source:      { key: "", scope: "#placeholder:value=\"source\"" },
                    stackTrace:
                    [
                        ["<x-component>"],
                        ["#shadow-root"],
                        ["<span #placeholder:value=\"source\" #inject:value=\"source\">"],
                    ],
                    type:  DescriptorType.Placeholder,
                },
            ],
            type: DescriptorType.Fragment,
        };

        const actual = Parser.parse(window.document, "x-component", template);

        const a = stringifyExpressions(actual);
        const e = stringifyExpressions(expected);

        assert.deepEqual(a, e);
    }

    @shouldFail @test
    public ErrorInvalidDirectiveKey(): void
    {
        const template = "<div #inject:></div>";

        const message = "Directive #inject has no key.";
        const stack   = "<x-component>\n   #shadow-root\n      <div #inject:>";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public ErrorInvalidInjectProperty(): void
    {
        const template = "<div #inject.invalid='key'></div>";

        const message = "Property 'invalid' does not exist on #inject directive";
        const stack   = "<x-component>\n   #shadow-root\n      <div #inject.invalid=\"key\">";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public ErrorInvalidSpreadProperty(): void
    {
        const template = "<div ...invalid='key'></div>";

        const message = "Flag 'invalid' not supported on spread directive.";
        const stack   = "<x-component>\n   #shadow-root\n      <div ...invalid=\"key\">";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public ErrorMultiplesDirectivesOfSameType(): void
    {
        const template = "<div #inject #inject.key='key'></div>";

        const message = "Multiples #inject directives on same element is not supported.";
        const stack   = "<x-component>\n   #shadow-root\n      <div #inject #inject.key=\"key\">";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public ErrorMultiplesDirectivesOfSameType2(): void
    {
        const template = "<div #inject #inject.scope='scope'></div>";

        const message = "Multiples #inject directives on same element is not supported.";
        const stack   = "<x-component>\n   #shadow-root\n      <div #inject #inject.scope=\"scope\">";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public ErrorMultiplesDirectivesOfSameType3(): void
    {
        const template = "<div #inject:key #inject></div>";

        const message = "Multiples #inject directives on same element is not supported.";
        const stack   = "<x-component>\n   #shadow-root\n      <div #inject:key #inject>";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public ErrorMultiplesDirectivesOfSameType4(): void
    {
        const template = "<div #inject:a #inject:b></div>";

        const message = "Multiples #inject directives on same element is not supported.";
        const stack   = "<x-component>\n   #shadow-root\n      <div #inject:a #inject:b>";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public ErrorInvalidExtendsCombination1(): void
    {
        const template = "<div ...attributes|properties='host' ...attributes='host'></div>";

        const message = "Flag 'attributes' already specified in ...attributes|properties=\"host\".";
        const stack   = "<x-component>\n   #shadow-root\n      <div ...attributes|properties=\"host\" ...attributes=\"host\">";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public ErrorInvalidExtendsCombination2(): void
    {
        const template = "<div ...attributes='host' ...attributes|properties='host'></div>";

        const message = "Flag 'attributes' already specified in ...attributes=\"host\".";
        const stack   = "<x-component>\n   #shadow-root\n      <div ...attributes=\"host\" ...attributes|properties=\"host\">";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public ErrorParsingTextNode(): void
    {
        const template = "<div>This is a invalid expression: {++true}</div>";

        const message = "Parsing error in 'This is a invalid expression: {++true}': Invalid left-hand side expression in prefix operation at position 33";
        const stack   = "<x-component>\n   #shadow-root\n      <div>\n         This is a invalid expression: {++true}";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public invalidTwoWayDataBind(): void
    {
        const template = "<x-foo ::value='host.value1 || host.value2'></x-foo>";

        const message = "Two way data bind cannot be applied to dynamic properties: \"host.value1 || host.value2\"";
        const stack   = "<x-component>\n   #shadow-root\n      <x-foo ::value=\"host.value1 || host.value2\">";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public invalidTwoWayDataBindWithDynamicProperty(): void
    {
        const template = "<x-foo ::value=\"host[a + b]\"></x-foo>";

        const message = "Two way data bind cannot be applied to dynamic properties: \"host[a + b]\"";
        const stack   = "<x-component>\n   #shadow-root\n      <x-foo ::value=\"host[a + b]\">";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public invalidTwoWayDataBindWithOptionalProperty(): void
    {
        const template = "<x-foo ::value=\"host?.value\"></x-foo>";

        const message = "Two way data bind cannot be applied to dynamic properties: \"host?.value\"";
        const stack   = "<x-component>\n   #shadow-root\n      <x-foo ::value=\"host?.value\">";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public errorParsingForDirective(): void
    {
        const template = "<div #inject:items='items' #if='false'><span #placeholder:items='items' #if='true' #for='x item of items'></span></div>";

        const message = "Parsing error in '#for=\"x item of items\"': Unexpected token item at position 2";
        const stack   = "<x-component>\n   #shadow-root\n      <div #inject:items=\"items\" #if=\"false\">\n         <span #placeholder:items=\"items\" #if=\"true\" #for=\"x item of items\">";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public errorParsingIfDirective(): void
    {
        const template = "<span #if='class'></span>";

        const message = "Parsing error in '#if=\"class\"': Unexpected token class at position 0";
        const stack   = "<x-component>\n   #shadow-root\n      <span #if=\"class\">";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public errorParsingElseIfDirective(): void
    {
        const template = "<span #if='true'></span><span #else-if='class'></span>";

        const message = "Parsing error in '#else-if=\"class\"': Unexpected token class at position 0";
        const stack   = "<x-component>\n   #shadow-root\n      ...1 other(s) node(s)\n      <span #else-if=\"class\">";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public unexpectedElseIf(): void
    {
        const template = "<span #if='true'></span><span #for='const item of items'></span><span #else-if></span>";

        const message = "Unexpected #else-if directive. #else-if must be used in an element next to an element that uses the #else-if directive.";
        const stack   = "<x-component>\n   #shadow-root\n      ...2 other(s) node(s)\n      <span #else-if>";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public unexpectedElse(): void
    {
        const template = "<span #if='true'></span><span #for='const item of items'></span><span #else></span>";

        const message = "Unexpected #else directive. #else must be used in an element next to an element that uses the #if or #else-if directive.";
        const stack   = "<x-component>\n   #shadow-root\n      ...2 other(s) node(s)\n      <span #else>";

        const actual   = tryAction(() => stringifyExpressions(Parser.parse(window.document, "x-component", template)));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }
}

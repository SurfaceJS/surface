import "./fixtures/dom";

import Expression                              from "@surface/expression";
import IArrowFunctionExpression                from "@surface/expression/interfaces/arrow-function-expression";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                              from "chai";
import ITemplateDescriptor                     from "../internal/interfaces/template-descriptor";
import InterpolatedExpression                  from "../internal/interpolated-expression";
import TemplateParser                          from "../internal/template-parser";

TemplateParser.testEnviroment = true;

@suite
export default class TemplateParserSpec
{
    @shouldPass @test
    public analyze(): void
    {
        const template = document.createElement("template");

        template.innerHTML =
        [
            "<span value='Hello {host.name}' #on:click='host.handler' #on:[key]='host[key]' ::value-a='host.value' :value-b='host.x + host.y'>",
            "Some {'interpolation'} here",
            "</span>",
            "<span #inject:title='{ title }'>",
            "<h1>{title}</h1>",
            "</span>",
            "<hr>",
            "<span #if='host.status == 1'>",
            "Active",
            "</span>",
            "<span #else-if='host.status == 2'>",
            "Waiting",
            "</span>",
            "<span #else>",
            "Suspended",
            "</span>",
            "<span #injector:value='{ name: host.name }'>",
            "Default {name}",
            "</span>",
            "<table>",
            "<tr>",
            "<th>Id</th>",
            "<th>Name</th>",
            "<th>Status</th>",
            "</tr>",
            "<tr #for='const item of host.items'>",
            "<th>{item.id}</th>",
            "<th>{item.name}</th>",
            "<th>{item.status}</th>",
            "</tr>",
            "</table>",
            "<hr>",
            "<span>{host.footer}</span>",
            "<!---->",
        ].join("");

        const expected: ITemplateDescriptor =
        {
            elements:
            [
                {
                    attributes:
                    [
                        {
                            name:       "value",
                            key:        "value",
                            expression: InterpolatedExpression.parse("Hello {host.name}"),
                            type:       "interpolation",
                        },
                        {
                            name:       "value-a",
                            key:        "valueA",
                            expression: Expression.literal("host.value"),
                            type:       "twoway",
                        },
                        {
                            name:       "value-b",
                            key:        "valueB",
                            expression: Expression.parse("host.x + host.y"),
                            type:       "oneway"
                        },
                    ],
                    directives:
                    [
                        {
                            expression: Expression.parse("host.handler"),
                            key:        Expression.literal("click"),
                            name:       "on",
                        },
                        {
                            expression: Expression.parse("host[key]"),
                            key:        Expression.identifier("key"),
                            name:       "on",
                        }
                    ],
                    textNodes:
                    [
                        {
                            path: "0-0",
                            expression: InterpolatedExpression.parse("Some {'interpolation'} here"),
                        }
                    ],
                    path: "0",
                },
                {
                    attributes: [],
                    directives: [],
                    path:       "9",
                    textNodes:
                    [
                        {
                            path: "9-0",
                            expression: InterpolatedExpression.parse("{host.footer}"),
                        }
                    ],
                }
            ],
            directives:
            {
                logical:
                [
                    {
                        branches:
                        [
                            {
                                descriptor:
                                {
                                    directives:
                                    {
                                        inject:   [],
                                        injector: [],
                                        logical:  [],
                                        loop:     [],
                                    },
                                    elements: [],
                                    lookup:   [],
                                },
                                expression: Expression.parse("host.status == 1"),
                                path:       "3",
                            },
                            {
                                descriptor:
                                {
                                    directives:
                                    {
                                        inject:   [],
                                        injector: [],
                                        logical:  [],
                                        loop:     [],
                                    },
                                    elements: [],
                                    lookup:   [],
                                },
                                expression: Expression.parse("host.status == 2"),
                                path:       "4",
                            },
                            {
                                descriptor:
                                {
                                    directives:
                                    {
                                        inject:   [],
                                        injector: [],
                                        logical:  [],
                                        loop:     [],
                                    },
                                    elements: [],
                                    lookup:   [],
                                },
                                expression: Expression.parse("true"),
                                path:       "5",
                            }
                        ]
                    }
                ],
                inject:
                [
                    {
                        descriptor:
                        {
                            directives:
                            {
                                inject:   [],
                                injector: [],
                                logical:  [],
                                loop:     [],
                            },
                            elements:
                            [
                                {
                                    attributes: [],
                                    directives: [],
                                    path:       "0-0",
                                    textNodes:
                                    [
                                        {
                                            path: "0-0-0",
                                            expression: InterpolatedExpression.parse("{title}")
                                        }
                                    ]
                                }
                            ],
                            lookup: [[0, 0], [0, 0, 0]],
                        },
                        destructured: true,
                        pattern:      (Expression.parse("({ title }) => 0") as IArrowFunctionExpression).parameters[0],
                        key:          Expression.literal("title"),
                        path:         "1"
                    },
                ],
                injector:
                [
                    {
                        descriptor:
                        {
                            directives:
                            {
                                inject:   [],
                                injector: [],
                                logical:  [],
                                loop:     [],
                            },
                            elements:
                            [
                                {
                                    attributes: [],
                                    directives: [],
                                    path:       "0",
                                    textNodes:
                                    [
                                        {
                                            path: "0-0",
                                            expression: InterpolatedExpression.parse("Default {name}")
                                        }
                                    ]
                                }
                            ],
                            lookup: [[0], [0, 0]],
                        },
                        expression: Expression.parse("({ name: host.name })"),
                        key:        Expression.literal("value"),
                        path:       "6"
                    },
                ],
                loop:
                [
                    {
                        alias: "item",
                        descriptor:
                        {
                            directives:
                            {
                                inject:   [],
                                injector: [],
                                logical:  [],
                                loop:     [],
                            },
                            elements:
                            [
                                {
                                    attributes: [],
                                    directives: [],
                                    textNodes:
                                    [
                                        {
                                            path: "0-0-0",
                                            expression: InterpolatedExpression.parse("{item.id}")
                                        },
                                    ],
                                    path: "0-0"
                                },
                                {
                                    attributes: [],
                                    directives: [],
                                    textNodes:
                                    [
                                        {
                                            path: "0-1-0",
                                            expression: InterpolatedExpression.parse("{item.name}")
                                        },
                                    ],
                                    path: "0-1"
                                },
                                {
                                    attributes: [],
                                    directives: [],
                                    textNodes:
                                    [
                                        {
                                            path: "0-2-0",
                                            expression: InterpolatedExpression.parse("{item.status}")
                                        },
                                    ],
                                    path: "0-2"
                                }
                            ],
                            lookup: [[0, 0], [0, 0, 0], [0, 1], [0, 1, 0], [0, 2], [0, 2, 0]],
                        },
                        destructured: false,
                        expression:   Expression.member(Expression.identifier("host"), Expression.identifier("items"), false),
                        operator:     "of",
                        path:         "7-0-1"
                    }
                ],
            },
            lookup: [[0], [0, 0], [1], [3], [4], [5], [6], [7, 0, 1], [9], [9, 0]],
        };

        const actual = TemplateParser.parseReference(template);

        assert.deepEqual(actual, expected);
    }

    @shouldPass @test
    public decomposeIfAndFor(): void
    {
        const template = document.createElement("template");

        template.innerHTML = "<span #if=\"true\" #for=\"const item of items\">{item.value}</span>";

        const expected = "<template #if=\"true\"><template #for=\"const item of items\"><span> </span></template></template>";

        const actual = TemplateParser.parse(template)[0].innerHTML;

        assert.equal(actual, expected);
    }

    @shouldPass @test
    public decomposeIfAndInjector(): void
    {
        const template = document.createElement("template");

        template.innerHTML = "<span #if=\"true\" #injector:value=\"source\">Placeholder</span>";

        const expected = "<template #if=\"true\"><template #injector:value=\"source\"><span>Placeholder</span></template></template>";

        const actual = TemplateParser.parse(template)[0].innerHTML;

        assert.equal(actual, expected);
    }

    @shouldPass @test
    public decomposeForAndInjector(): void
    {
        const template = document.createElement("template");

        template.innerHTML = "<span #for=\"const [key, value] of items\" #injector:[key]=\"source\">{source.value}</span>";

        const expected = "<template #for=\"const [key, value] of items\"><template #injector:[key]=\"source\"><span> </span></template></template>";

        const actual = TemplateParser.parse(template)[0].innerHTML;

        assert.equal(actual, expected);
    }

    @shouldPass @test
    public decomposeIfAndInject(): void
    {
        const template = document.createElement("template");

        template.innerHTML = "<span #if=\"true\" #inject:value=\"source\">{source.value}</span>";

        const expected = "<template #if=\"true\"><template #inject:value=\"source\"><span> </span></template></template>";

        const actual = TemplateParser.parse(template)[0].innerHTML;

        assert.equal(actual, expected);
    }

    @shouldPass @test
    public decomposeForAndInject(): void
    {
        const template = document.createElement("template");

        template.innerHTML = "<span #for=\"const item of items\" #inject:value=\"source\">{source.value}</span>";

        const expected = "<template #for=\"const item of items\"><template #inject:value=\"source\"><span> </span></template></template>";

        const actual = TemplateParser.parse(template)[0].innerHTML;

        assert.equal(actual, expected);
    }

    @shouldPass @test
    public decompose(): void
    {
        const template = document.createElement("template");

        template.innerHTML = "<span class=\"foo\" #inject:value=\"source\" #if=\"true\" #injector:value=\"source\" #for=\"const item of items\">{source.value}</span>";

        const expected = "<template #inject:value=\"source\"><template #if=\"true\"><template #injector:value=\"source\"><template #for=\"const item of items\"><span class=\"foo\"> </span></template></template></template></template>";

        const actual = TemplateParser.parse(template)[0].innerHTML;

        assert.equal(actual, expected);
    }

    @shouldPass @test
    public decomposeInjectorAndInject(): void
    {
        const template = document.createElement("template");

        template.innerHTML = "<span #injector:value=\"source\" #inject:value=\"source\">{source.value}</span>";

        const expected = "<template #injector:value=\"source\"><template #inject:value=\"source\"><span> </span></template></template>";

        const actual = TemplateParser.parse(template)[0].innerHTML;

        assert.equal(actual, expected);
    }

    @shouldFail @test
    public InvalidForDirective(): void
    {
        const template = document.createElement("template");

        template.innerHTML = "<span #for='item of items'></span>";

        assert.throw(() => TemplateParser.parse(template), `Invalid #for directive expression: item of items.`);
    }

    @shouldFail @test
    public unexpectedElseIf(): void
    {
        const template = document.createElement("template");

        template.innerHTML = "<span #for='const item of items'></span><span #else-if></span>";

        assert.throw(() => TemplateParser.parse(template), `Unexpected #else-if directive. #else-if must be used in an element next to an element that uses the #else-if directive.`);
    }

    @shouldFail @test
    public unexpectedElse(): void
    {
        const template = document.createElement("template");

        template.innerHTML = "<span #for='const item of items'></span><span #else></span>";

        assert.throw(() => TemplateParser.parse(template), `Unexpected #else directive. #else must be used in an element next to an element that uses the #if or #else-if directive.`);
    }

    @shouldFail @test
    public unresgisteredDirective(): void
    {
        const template = document.createElement("template");

        template.innerHTML = "<span #foo='bar'></span>";

        assert.throw(() => TemplateParser.parse(template), `Unregistered directive #foo.`);
    }
}
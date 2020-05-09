import "./fixtures/dom";

import { Action }                                                        from "@surface/core";
import IIdentifier                                                       from "@surface/expression/interfaces/identifier";
import { shouldFail, shouldPass, suite, test }                           from "@surface/test-suite";
import { assert }                                                        from "chai";
import ITemplateDescriptor                                               from "../internal/interfaces/template-descriptor";
import { parseDestructuredPattern, parseExpression, parseInterpolation } from "../internal/parsers";
import TemplateParseError                                                from "../internal/template-parse-error";
import TemplateParser                                                    from "../internal/template-parser";

TemplateParser.testEnviroment = true;

type RawError = { message: string }|Pick<TemplateParseError, "message"|"stack">;

function tryAction(action: Action): RawError
{
    try
    {
        action();
    }
    catch (error)
    {
        return toRaw(error);
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
    else
    {
        return { message: error.message };
    }
}

@suite
export default class TemplateParserSpec
{
    @shouldPass @test
    public analyze(): void
    {
        const template = document.createElement("template");

        template.innerHTML =
        [
            "<span value='Hello {host.name}' #on:click='host.handler' ::value-a='host.value' :value-b='host.x + host.y'>",
            "Some {'interpolation'} here",
            "</span>",
            "<span #inject>",
            "Empty",
            "</span>",
            "<span #inject:title='{ title }'>",
            "<h1>{title}</h1>",
            "</span>",
            "<span #inject='{ title }' #inject-key='dynamicInjectKey'>",
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
            "<span #injector>",
            "Default Empty",
            "</span>",
            "<span #injector:value='({ name: host.name })'>",
            "Default {name}",
            "</span>",
            "<span #injector='({ name: host.name })' #injector-key='dynamicInjectorKey'>",
            "Default {name}",
            "</span>",
            "<table>",
            "<tr #on='host.handler' #on-key='dynamicOnKey' >",
            "<th>Id</th>",
            "<th>Name</th>",
            "<th>Status</th>",
            "</tr>",
            "<tr onclick='fn({ clicked })' #for='const item of host.items'>",
            "<td>{item.id}</td>",
            "<td>{item.name}</td>",
            "<td>{item.status}</td>",
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
                            expression:  parseInterpolation("Hello {host.name}"),
                            key:         "value",
                            name:        "value",
                            observables: [["host", "name"]],
                            type:        "interpolation",
                        },
                        {
                            name:        "value-a",
                            key:         "valueA",
                            expression:  parseExpression("'host.value'"),
                            observables: [],
                            type:        "twoway",
                        },
                        {
                            name:        "value-b",
                            key:         "valueB",
                            expression:  parseExpression("host.x + host.y"),
                            observables: [["host", "x"], ["host", "y"]],
                            type:        "oneway"
                        },
                    ],
                    directives:
                    [
                        {
                            key:              parseExpression("'click'"),
                            keyObservables:   [],
                            name:             "on",
                            value:            parseExpression("host.handler"),
                            valueObservables: [["host", "handler"]]
                        }
                    ],
                    textNodes:
                    [
                        {
                            path:        "0-0",
                            expression:  parseInterpolation("Some {'interpolation'} here"),
                            observables: []
                        }
                    ],
                    path: "0",
                },
                {
                    attributes: [],
                    directives:
                    [
                        {
                            key:              parseExpression("dynamicOnKey"),
                            keyObservables:   [],
                            name:             "on",
                            value:            parseExpression("host.handler"),
                            valueObservables: [["host", "handler"]]
                        }
                    ],
                    path:       "11-0-0",
                    textNodes:  [],
                },
                {
                    attributes: [],
                    directives: [],
                    path:       "13",
                    textNodes:
                    [
                        {
                            path:        "13-0",
                            expression:  parseInterpolation("{host.footer}"),
                            observables: [["host", "footer"]]
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
                                expression: parseExpression("host.status == 1"),
                                path:       "5",
                                observables: [["host", "status"]]
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
                                expression: parseExpression("host.status == 2"),
                                path:       "6",
                                observables: [["host", "status"]]
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
                                expression: parseExpression("true"),
                                path:       "7",
                                observables: []
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
                            elements: [],
                            lookup:   [],
                        },
                        key:     parseExpression("'default'"),
                        path:    "1",
                        pattern: parseDestructuredPattern("__scope__"),
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
                            elements:
                            [
                                {
                                    attributes: [],
                                    directives: [],
                                    path:       "0-0",
                                    textNodes:
                                    [
                                        {
                                            path:        "0-0-0",
                                            expression:  parseInterpolation("{title}"),
                                            observables: []
                                        }
                                    ]
                                }
                            ],
                            lookup: [[0, 0], [0, 0, 0]],
                        },
                        pattern: parseDestructuredPattern("{ title }"),
                        key:     parseExpression("'title'"),
                        path:    "2"
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
                            elements:
                            [
                                {
                                    attributes: [],
                                    directives: [],
                                    path:       "0-0",
                                    textNodes:
                                    [
                                        {
                                            path:        "0-0-0",
                                            expression:  parseInterpolation("{title}"),
                                            observables: []
                                        }
                                    ]
                                }
                            ],
                            lookup: [[0, 0], [0, 0, 0]],
                        },
                        pattern: parseDestructuredPattern("{ title }"),
                        key:     parseExpression("dynamicInjectKey"),
                        path:    "3"
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
                            elements: [],
                            lookup:   [],
                        },
                        expression:  parseExpression("({ })"),
                        key:         parseExpression("'default'"),
                        path:        "8",
                        observables: []
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
                            elements:
                            [
                                {
                                    attributes: [],
                                    directives: [],
                                    path:       "0",
                                    textNodes:
                                    [
                                        {
                                            path:        "0-0",
                                            expression:  parseInterpolation("Default {name}"),
                                            observables: []
                                        }
                                    ]
                                }
                            ],
                            lookup: [[0], [0, 0]],
                        },
                        expression:  parseExpression("({ name: host.name })"),
                        key:         parseExpression("'value'"),
                        path:        "9",
                        observables: [["host", "name"]]
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
                            elements:
                            [
                                {
                                    attributes: [],
                                    directives: [],
                                    path:       "0",
                                    textNodes:
                                    [
                                        {
                                            path:        "0-0",
                                            expression:  parseInterpolation("Default {name}"),
                                            observables: []
                                        }
                                    ]
                                }
                            ],
                            lookup: [[0], [0, 0]],
                        },
                        expression:  parseExpression("({ name: host.name })"),
                        key:         parseExpression("dynamicInjectorKey"),
                        path:        "10",
                        observables: [["host", "name"]]
                    },
                ],
                loop:
                [
                    {
                        left: parseExpression("item") as IIdentifier,
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
                                            path:        "0-0-0",
                                            expression:  parseInterpolation("{item.id}"),
                                            observables: [["item", "id"]]
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
                                            path:        "0-1-0",
                                            expression:  parseInterpolation("{item.name}"),
                                            observables: [["item", "name"]]
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
                                            path:        "0-2-0",
                                            expression:  parseInterpolation("{item.status}"),
                                            observables: [["item", "status"]]
                                        },
                                    ],
                                    path: "0-2"
                                }
                            ],
                            lookup: [[0, 0], [0, 0, 0], [0, 1], [0, 1, 0], [0, 2], [0, 2, 0]],
                        },
                        right:       parseExpression("host.items"),
                        operator:    "of",
                        path:        "11-0-1",
                        observables: [["host", "items"]]
                    }
                ],
            },
            lookup: [[0], [0, 0], [1], [2], [3], [5], [6], [7], [8], [9], [10], [11, 0, 0], [11, 0, 1], [13], [13, 0]],
        };

        const actual = TemplateParser.parseReference(template);

        assert.deepEqual(actual, expected);
    }

    @shouldPass @test
    public escapeAttributes(): void
    {
        const template = document.createElement("template");

        template.innerHTML = "<span *style=\"display: {host.display}\"></span>";

        const expected = "<span style=\"\"></span>";

        const actual = TemplateParser.parse(template)[0].innerHTML;

        assert.equal(actual, expected);
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
    public decomposeInjectorWithInjectorKey(): void
    {
        const template = document.createElement("template");

        template.innerHTML = "<span #injector=\"source\" #injector-key=\"key\">{source.value}</span>";

        const expected = "<template #injector=\"source\" #injector-key=\"key\"><span> </span></template>";

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

        template.innerHTML = "<span #inject:items='items' #if='true' #for='x item of items'></span>";

        const message = "Error parsing \"x item of items\" in \"#for='x item of items'\": Unexpected token item at position 2";
        const stack   = "#inject:items='items'\n   #if='true'\n      #for='x item of items'";

        const actual   = tryAction(() => TemplateParser.parse(template));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public unexpectedElseIf(): void
    {
        const template = document.createElement("template");

        template.innerHTML = "<span #for='const item of items'></span><span #else-if></span>";

        const message = "Unexpected #else-if directive. #else-if must be used in an element next to an element that uses the #else-if directive.";
        const stack   = "...1 other(s) node(s)\n<span #else-if=\"\">";

        const actual   = tryAction(() => TemplateParser.parse(template));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public unexpectedElse(): void
    {
        const template = document.createElement("template");

        template.innerHTML = "<span #for='const item of items'></span><span #else></span>";

        const message = "Unexpected #else directive. #else must be used in an element next to an element that uses the #if or #else-if directive.";
        const stack   = "...1 other(s) node(s)\n<span #else=\"\">";

        const actual   = tryAction(() => TemplateParser.parse(template));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public unresgisteredDirective(): void
    {
        const template = document.createElement("template");

        template.innerHTML = "<div><div></div><span><span #foo='bar'></span></span></div>";

        const message = "Unregistered directive #foo.";
        const stack   = "<div>\n   ...1 other(s) node(s)\n   <span>\n      <span #foo=\"bar\">";

        const actual   = tryAction(() => TemplateParser.parse(template));
        const expected = toRaw(new TemplateParseError(message, stack));

        assert.deepEqual(actual, expected);
    }
}
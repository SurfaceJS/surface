import "./dom-mock";

import { expect } from "chai";

import { context, validExpressions } from "./data-expressions";

import Parser from "@surface/custom-element/internal/parser";

describe
(
    "Expressions",
    () =>
    {
        for (const expression of validExpressions)
        {
            it
            (
                `Expression ${expression.raw} must be evaluated to ${expression.type.name}: ${expression.value}`,
                () =>
                {
                    if (expression.raw == "[1, 'foo', true, ...[{ foo: 'bar' }, { bar: 'foo' }]")
                    {
                        debugger;
                    }

                    const result = Parser.parse(context, expression.raw);
                    expect(result.evaluate()).to.deep.equal(expression.value);
                    expect(result).instanceof(expression.type);
                }
            );
        }
    }
);
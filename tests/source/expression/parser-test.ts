import { expect } from "chai";

import { context, validExpressions } from "./data-expressions";

import Parser from "@surface/expression/internal/parser";

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
                    if (expression.raw == "{ foo: 1, \"bar\": [1, ...[2, 3]], [{id: 1}.id]: 1 }")
                    {
                        debugger;
                    }

                    const result = Parser.parse(expression.raw, context);
                    expect(result.evaluate()).to.deep.equal(expression.value);
                    expect(result).instanceof(expression.type);
                }
            );
        }
    }
);
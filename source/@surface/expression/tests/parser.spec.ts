import { expect } from "chai";

import { context, invalidExpressions, validExpressions } from "./fixtures/expressions";

import Parser      from "../internal/parser";

describe
(
    "Expressions",
    () =>
    {
        describe
        (
            "Expressions should work",
            () =>
            {
                for (const expression of validExpressions)
                {
                    it
                    (
                        `Expression ${expression.raw} must be evaluated to ${expression.type.name}: ${expression.value}`,
                        () =>
                        {
                            const result = Parser.parse(expression.raw, context);
                            expect(result.evaluate()).to.deep.equal(expression.value);
                            expect(result).instanceof(expression.type);
                        }
                    );
                }
            }
        );

        describe
        (
            "Expressions should throw",
            () =>
            {
                for (const expression of invalidExpressions)
                {
                    it
                    (
                        `Expression ${expression.raw} must throw an error`,
                        () =>
                        {
                            try
                            {
                                Parser.parse(expression.raw, context);
                            }
                            catch (error)
                            {
                                expect(error).to.includes(expression.error);
                            }
                        }
                    );
                }
            }
        );
    }
);
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
            "Valid expressions",
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
            "Invalid expressions",
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
// eslint-disable-next-line import/no-unassigned-import
import "@surface/dom-shim";

import Expression                                         from "@surface/expression";
import { batchTest, suite }                               from "@surface/test-suite";
import chai                                               from "chai";
import ObserverVisitor                                    from "../internal/observer-visitor.js";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { ObservableExpression }                      from "./observer-visitor-expected.js";
import { observableExpressions, unobservableExpressions } from "./observer-visitor-expected.js";

@suite
export default class ObserverVisitorSpec
{
    @batchTest(observableExpressions, x => `observable expression ${x.expression}; expected paths: ${x.expected.map(x => `[${x}]`)}`)
    public observableExpressions(observableExpression: ObservableExpression): void
    {
        const expression = Expression.parse(observableExpression.expression);

        const actual = ObserverVisitor.observe(expression);

        chai.assert.deepEqual(actual, observableExpression.expected);
    }

    @batchTest(unobservableExpressions, x => `unobservable expression ${x}; shouldn't have observers`)
    public unobservableExpressions(unobservableExpression: string): void
    {
        const expression = Expression.parse(unobservableExpression);

        const paths = ObserverVisitor.observe(expression);

        chai.assert.equal(paths.length, 0);
    }
}
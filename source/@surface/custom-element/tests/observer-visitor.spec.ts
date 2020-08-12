// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom";

import Expression           from "@surface/expression";
import { batchTest, suite } from "@surface/test-suite";
import { assert }           from "chai";
import ObserverVisitor      from "../internal/observer-visitor";
import
{
    ObservableExpression,
    observableExpressions,
    unobservableExpressions,
} from "./expectations/observer-visitor-expected";

@suite
export default class ObserverVisitorSpec
{
    @batchTest(observableExpressions, x => `observable expression ${x.expression}; expected paths: ${x.expected.map(x => `[${x}]`)}`)
    public observableExpressions(observableExpression: ObservableExpression): void
    {
        const expression = Expression.parse(observableExpression.expression);

        const actual = ObserverVisitor.observe(expression);

        assert.deepEqual(actual, observableExpression.expected);
    }

    @batchTest(unobservableExpressions, x => `unobservable expression ${x}; shouldn't have observers`)
    public unobservableExpressions(unobservableExpression: string): void
    {
        const expression = Expression.parse(unobservableExpression);

        const paths = ObserverVisitor.observe(expression);

        assert.equal(paths.length, 0);
    }
}
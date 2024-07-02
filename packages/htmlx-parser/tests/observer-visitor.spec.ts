// eslint-disable-next-line import/no-unassigned-import
import "@surface/dom-shim";

import { Parser }                                             from "@surface/expression";
import { batchTest, suite }                                   from "@surface/test-suite";
import { assert }                                             from "chai";
import ObserverVisitor                                        from "../internal/observer-visitor.js";
import { type Scenarios, scenarios, unobservableExpressions } from "./observer-visitor.scn.js";

@suite
export default class ObserverVisitorSpec
{
    @batchTest(scenarios, x => `observable expression ${x.expression}; expected paths: ${x.expected.map(x => `[${x}]`)}`, x => x.skip)
    public observableExpressions(observableExpression: Scenarios): void
    {
        const expression = Parser.parse(observableExpression.expression);

        const actual = ObserverVisitor.observe(expression);

        assert.deepEqual(actual, observableExpression.expected);
    }

    @batchTest(unobservableExpressions, x => `unobservable expression ${x}; shouldn't have observers`)
    public unobservableExpressions(unobservableExpression: string): void
    {
        const expression = Parser.parse(unobservableExpression);

        const paths = ObserverVisitor.observe(expression);

        assert.equal(paths.length, 0);
    }
}

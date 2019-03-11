import { Indexer }     from "@surface/core";
import { suite, test } from "@surface/test-suite";
import * as chai       from "chai";
import DataBind        from "../";

@suite
export default class DataBindSpec
{
    @test
    public twoWay(): void
    {
        const left  = { very: { deep: { path: { value: 1 } } } };
        const right = { anotherValue: 2 };

        //DataBind.twoWay({ emmiter: { target: left.very.deep.path, key: "value" }, receiver: { target: right, key: "anotherValue" } });
        DataBind.oneWay({ emmiter: { target: left,  key: "very.deep.path.value" }, receiver: { target: right, key: "anotherValue" } });
        DataBind.oneWay({ emmiter: { target: right, key: "anotherValue" },         receiver: { target: left.very.deep.path, key: "value" } });

        right.anotherValue = 5;

        chai.expect(left.very.deep.path.value, "left.very.deep.path.value == 5").to.equal(5);

        const deep = { path: { value: 1 } };

        const oldDeep = left.very.deep;

        left.very.deep = deep;

        chai.expect(right.anotherValue, "right.anotherValue == 1").to.equal(1);

        chai.expect(oldDeep.path.value, "oldDeep.path.value == 1").to.equal(1);

        //oldDeep.path.value = 5;

        //chai.expect(right.anotherValue, "right.anotherValue == 1").to.equal(1);

        chai.expect(left.very.deep.path.value, "left.very.deep.path.value == 1").to.equal(1);

        (left as Indexer).very = null;

        chai.expect(right.anotherValue, "right.anotherValue == 1").to.equal(1);

        left.very = { deep: { path: { value: 100 } } };

        chai.expect(right.anotherValue, "right.anotherValue == 100").to.equal(100);
    }
}
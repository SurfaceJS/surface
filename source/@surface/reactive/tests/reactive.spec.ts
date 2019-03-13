import { Nullable }    from "@surface/core";
import { suite, test } from "@surface/test-suite";
import * as chai       from "chai";
import Reactive        from "..";

@suite
export default class ReactiveSpec
{
    @test
    public observeProperty(): void
    {
        const A = { child: { name: "A.child", value: 1 }};
        const B = { child: { name: "B.child", value: 2 }};

        Reactive.observeProperty(A.child, "value", x => B.child.value = x);

        chai.expect(A.child.value == B.child.value, "#1").to.equal(true);

        A.child.value = 5;

        chai.expect(A.child.value == B.child.value, "#2").to.equal(true);

        B.child.value = 6;

        chai.expect(A.child.value == B.child.value, "#3").to.equal(false);
    }

    @test
    public observePath(): void
    {
        const A = { child: { name: "A.child", value: 1 }};
        const B = { child: { name: "B.child", value: 2 }};

        Reactive.observePath(A, "child.value", x => B.child.value = x as number);

        chai.expect(A.child.value == B.child.value, "#1").to.equal(true);

        A.child.value = 5;

        chai.expect(A.child.value == B.child.value, "#2").to.equal(true);

        B.child.value = 6;

        chai.expect(A.child.value == B.child.value, "#3").to.equal(false);

        A.child = { name: "new A.child", value: 10 };

        chai.expect(A.child.value == B.child.value, "#4").to.equal(true);
    }

    @test
    public observePathTwoWay(): void
    {
        const A = { very: { deep: { path: { name: "A.child", value: 1 } } } };
        const B = { very: { deep: { path: { name: "B.child", value: 2 } } } };
        const C = { very: { deep: { path: { name: "C.child", value: 3 } } } };
        const D = { very: { deep: { path: { name: "C.child", value: 4 } } } };

        Reactive.observePath(A, "very.deep.path.value", x => B.very.deep.path.value = x as number);
        Reactive.observePath(B, "very.deep.path.value", x => A.very.deep.path.value = x as number);

        chai.expect(A.very.deep.path.value == B.very.deep.path.value, "#1").to.equal(true);

        A.very.deep.path.value = 5;

        chai.expect(A.very.deep.path.value == B.very.deep.path.value, "#2").to.equal(true);

        B.very.deep.path.value = 6;

        chai.expect(A.very.deep.path.value == B.very.deep.path.value, "#3").to.equal(true);

        D.very = A.very;

        A.very = { deep: { path: { name: "new A.child", value: 10 } } };

        Reactive.observePath(D, "very.deep.path.value", x => C.very.deep.path.value = x as number);
        Reactive.observePath(C, "very.deep.path.value", x => D.very.deep.path.value = x as number);

        D.very.deep.path.value = 5;
        D.very.deep.path.name  = "replaced A.child";

        chai.expect(A.very.deep.path.value == B.very.deep.path.value, "#4").to.equal(true);

        chai.expect(D.very.deep.path.value == C.very.deep.path.value, "#5").to.equal(true);

        A.very.deep.path = D.very.deep.path;

        chai.expect(A.very.deep.path.value == B.very.deep.path.value && A.very.deep.path.value == C.very.deep.path.value, "#6").to.equal(true);

        D.very.deep.path = A.very.deep.path;

        A.very.deep.path = { name: "new A.child", value: 10 };

        chai.expect(A.very.deep.path.value == B.very.deep.path.value && A.very.deep.path.value == C.very.deep.path.value, "#7").to.equal(true);

        (A.very as Nullable) = null;

        chai.expect(A.very, "#8").to.equal(null);
        chai.expect(B.very.deep.path.value, "#9").to.equal(10);
        chai.expect(C.very.deep.path.value, "#10").to.equal(10);

        A.very = { deep: { path: { name: "A.child", value: 20 } } };

        chai.expect(A.very.deep.path.value == B.very.deep.path.value && A.very.deep.path.value == C.very.deep.path.value, "#7").to.equal(true);
    }
}
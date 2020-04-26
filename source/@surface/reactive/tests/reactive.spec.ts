import { Nullable }                            from "@surface/core";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                              from "chai";
import Reactive                                from "..";
import Metadata                                from "../internal/metadata";
import Reactor                                 from "../internal/reactor";

@suite
export default class ReactiveSpec
{
    @test @shouldPass
    public getReactor(): void
    {
        const emmiter  = { instance: { name: "Emmiter",  value: 1 }};
        const receiver = { instance: { name: "Receiver", value: 2 }};

        Reactive.observe(emmiter.instance, "value", { notify: x => receiver.instance.value = x });

        assert.equal(Reactive.getReactor({ }), undefined);
        assert.instanceOf(Reactive.getReactor(emmiter.instance), Reactor);
    }

    @test @shouldPass
    public notify(): void
    {
        let notified = false;

        const emmiter = { instance: { name: "Emmiter",  value: 1 }};

        Reactive.observe(emmiter.instance, "value", { notify: () => notified = true });

        Reactive.notify(emmiter.instance, "value");

        assert.isTrue(notified);
    }

    @test @shouldPass
    public hasObserver(): void
    {
        const emmiter  = { instance: { name: "Emmiter",  value: 1 }};
        const receiver = { instance: { name: "Receiver", value: 2 }};

        assert.isFalse(Reactive.hasObserver(emmiter.instance, "value"));

        Reactive.observe(emmiter.instance, "value", { notify: x => receiver.instance.value = x });

        assert.isTrue(Reactive.hasObserver(emmiter.instance, "value"));
    }

    @test @shouldPass
    public observeProperty(): void
    {
        const emmiter   = { instance: { name: "Emmiter",  value: 1 }};
        const receiverA = { instance: { name: "Receiver A", value: 2 }};
        const receiverB = { instance: { name: "Receiver B", value: 2 }};

        Reactive.observe(emmiter.instance, "value", { notify: x => receiverA.instance.value = x });
        Reactive.observe(emmiter.instance, "value", { notify: x => receiverB.instance.value = x });

        assert.isTrue(emmiter.instance.value == receiverA.instance.value, "#1");
        assert.isTrue(emmiter.instance.value == receiverB.instance.value, "#1");

        emmiter.instance.value = 5;

        assert.equal(receiverA.instance.value, 5, "#2");
        assert.equal(receiverB.instance.value, 5, "#2");

        receiverA.instance.value = 6;
        receiverB.instance.value = 6;

        assert.equal(emmiter.instance.value, 5, "#3");
    }

    @test @shouldPass
    public observePropertyArray(): void
    {
        const emmiter  = { instance: { name: "Emmiter",  elements: [{ value: 1 }] }};
        const receiver = { instance: { name: "Receiver", elements: [{ value: 2 }] }};

        Reactive.observe(emmiter.instance, "elements.0.value", { notify: (x: number) => receiver.instance.elements[0].value = x });

        assert.isTrue(emmiter.instance.elements[0].value == receiver.instance.elements[0].value, "#1");

        emmiter.instance.elements[0].value = 5;

        assert.equal(receiver.instance.elements[0].value, 5, "#2");

        receiver.instance.elements[0].value = 6;

        assert.equal(emmiter.instance.elements[0].value, 5, "#3");
    }

    @test @shouldPass
    public observePropertyWithOutterReceiver(): void
    {
        const emmiter  = { instance: { name: "Emmiter",  value: 1 }};
        const receiver = { instance: { name: "Receiver", value: 2 }};

        const listener = { notify: (x: number) => receiver.instance.value = x };

        const { observer } = Reactive.observe(emmiter, "instance.value");

        observer.subscribe(listener);

        assert.equal(emmiter.instance.value == receiver.instance.value, false, "#1");

        emmiter.instance.value = 5;

        assert.equal(receiver.instance.value, 5, "#2");

        receiver.instance.value = 6;

        assert.equal(emmiter.instance.value, 5, "#3");
    }

    @test @shouldPass
    public observePropertyLazySubscription(): void
    {
        const emmiter  = { instance: { name: "Emmiter",  value: 1 }};
        const receiver = { instance: { name: "Receiver", value: 2 }};

        const { observer } = Reactive.observe(emmiter.instance, "value");

        observer.subscribe({ notify: x => receiver.instance.value = x });

        assert.equal(emmiter.instance.value == receiver.instance.value, false, "#1");

        observer.notify(emmiter.instance.value);

        assert.isTrue(emmiter.instance.value == receiver.instance.value, "#2");

        emmiter.instance.value = 5;

        assert.equal(receiver.instance.value, 5, "#3");

        receiver.instance.value = 6;

        assert.equal(emmiter.instance.value, 5, "#4");
    }

    @test @shouldPass
    public observePropertyLazySubscriptionWithListener(): void
    {
        const emmiter  = { instance: { name: "Emmiter",  value: 1 }};
        const receiver = { instance: { name: "Receiver", value: 2 }};

        const { observer } = Reactive.observe(emmiter.instance, "value", { notify: x => receiver.instance.value = x }, true);

        assert.equal(emmiter.instance.value == receiver.instance.value, false, "#1");

        observer.notify(emmiter.instance.value);

        assert.isTrue(emmiter.instance.value == receiver.instance.value, "#2");

        emmiter.instance.value = 5;

        assert.equal(receiver.instance.value, 5, "#3");

        receiver.instance.value = 6;

        assert.equal(emmiter.instance.value, 5, "#4");
    }

    @test @shouldPass
    public observeStringPath(): void
    {
        const emmiter  = { instance: { name: "Emmiter A", deep: { path: { value: 1 } } } };
        const receiver = { instance: { name: "Receiver A", deep: { path: { value: 1 } } } };

        Reactive.observe(emmiter.instance, "deep.path.value", { notify: (x: number) => receiver.instance.deep.path.value = x });

        assert.isTrue(emmiter.instance.deep.path.value == receiver.instance.deep.path.value, "#1");

        emmiter.instance.deep.path.value = 5;

        assert.equal(receiver.instance.deep.path.value, 5, "#2");

        receiver.instance.deep.path.value = 6;

        assert.equal(emmiter.instance.deep.path.value, 5, "#3");
    }

    @test @shouldPass
    public observeStringPathLazy(): void
    {
        const emmiter  = { instance: { name: "Emmiter A", deep: { path: { value: 1 } } } };
        const receiver = { instance: { name: "Receiver A", deep: { path: { value: 2 } } } };

        Reactive.observe(emmiter.instance, "deep.path.value", { notify: (x: number) => receiver.instance.deep.path.value = x }, true);

        assert.isFalse(emmiter.instance.deep.path.value == receiver.instance.deep.path.value, "#1");

        emmiter.instance.deep.path.value = 5;

        assert.equal(receiver.instance.deep.path.value, 5, "#2");

        receiver.instance.deep.path.value = 6;

        assert.equal(emmiter.instance.deep.path.value, 5, "#3");
    }

    @test @shouldPass
    public observeArrayPath(): void
    {
        const emmiter  = { instance: { name: "Emmiter A", deep: { path: { value: 1 } } } };
        const receiver = { instance: { name: "Receiver A", deep: { path: { value: 1 } } } };

        Reactive.observe(emmiter.instance, "deep.path.value".split("."), { notify: (x: number) => receiver.instance.deep.path.value = x });

        assert.isTrue(emmiter.instance.deep.path.value == receiver.instance.deep.path.value, "#1");

        emmiter.instance.deep.path.value = 5;

        assert.equal(receiver.instance.deep.path.value, 5, "#2");

        receiver.instance.deep.path.value = 6;

        assert.equal(emmiter.instance.deep.path.value, 5, "#3");
    }

    @test @shouldPass
    public observeTwoWayStringPath(): void
    {
        const emmiter  = { instance: { name: "Emmiter A", deep: { path: { value: 1 } } } };
        const receiver = { instance: { name: "Receiver A", deep: { path: { value: 1 } } } };

        Reactive.observeTwoWay(emmiter.instance, "deep.path.value", receiver.instance, "deep.path.value");

        assert.isTrue(emmiter.instance.deep.path.value == receiver.instance.deep.path.value, "#1");

        emmiter.instance.deep.path.value = 5;

        assert.equal(receiver.instance.deep.path.value, 5, "#2");

        receiver.instance.deep.path.value = 6;

        assert.equal(emmiter.instance.deep.path.value, 6, "#3");
    }

    @test @shouldPass
    public observeTwoWayArrayPath(): void
    {
        const emmiter  = { instance: { name: "Emmiter A", deep: { path: { value: 1 } } } };
        const receiver = { instance: { name: "Receiver A", deep: { path: { value: 1 } } } };

        Reactive.observeTwoWay(emmiter.instance, "deep.path.value".split("."), receiver.instance, "deep.path.value".split("."));

        assert.isTrue(emmiter.instance.deep.path.value == receiver.instance.deep.path.value, "#1");

        emmiter.instance.deep.path.value = 5;

        assert.equal(receiver.instance.deep.path.value, 5, "#2");

        receiver.instance.deep.path.value = 6;

        assert.equal(emmiter.instance.deep.path.value, 6, "#3");
    }

    @test @shouldPass
    public observePathEdgeCase(): void
    {
        const emmiterA = { instance: { name: "Emmiter A", deep: { path: { value: 1 } } } };
        const emmiterB = { instance: { name: "Emmiter B", deep: { path: { value: 2 } } } };

        const receiverA1 = { instance: { name: "Receiver A", deep: { path: { value: 1 } } } };
        const receiverA2 = { instance: { name: "Receiver C", deep: { path: { value: 3 } } } };
        const receiverB1 = { instance: { name: "Receiver B", deep: { path: { value: 2 } } } };
        const receiverB2 = { instance: { name: "Receiver D", deep: { path: { value: 4 } } } };

        Reactive.observe(emmiterA, "instance.deep.path.value", { notify: x => receiverA1.instance.deep.path.value = x as number });
        Reactive.observe(emmiterA, "instance.deep",            { notify: x => receiverA2.instance.deep = x as typeof receiverA2["instance"]["deep"] });
        Reactive.observe(emmiterB, "instance.deep.path.value", { notify: x => receiverB1.instance.deep.path.value = x as number });
        Reactive.observe(emmiterB, "instance.deep",            { notify: x => receiverB2.instance.deep = x as typeof receiverA2["instance"]["deep"] });

        assert.equal(receiverA1.instance.deep.path.value, 1, "#01");
        assert.equal(receiverA2.instance.deep.path.value, 1, "#02");
        assert.equal(receiverA2.instance.deep, emmiterA.instance.deep, "#02");

        assert.equal(receiverB1.instance.deep.path.value, 2, "#03");
        assert.equal(receiverB2.instance.deep.path.value, 2, "#04");
        assert.equal(receiverB2.instance.deep, emmiterB.instance.deep, "#04");

        emmiterA.instance.deep.path.value = 5;

        assert.equal(receiverA1.instance.deep.path.value, 5, "#05");

        receiverA1.instance.deep.path.value = 6;

        assert.equal(emmiterA.instance.deep.path.value, 5, "#06");

        receiverA2.instance.deep = { path: { value: 6 } };

        assert.equal(emmiterA.instance.deep.path.value, 5, "#07");

        emmiterA.instance = { name: "new A", deep: { path: { value: 10 } } };

        assert.equal(receiverA1.instance.deep.path.value, 10, "#08");
        assert.equal(receiverA2.instance.deep, emmiterA.instance.deep, "#09");

        emmiterA.instance.deep.path.value = 15;

        assert.equal(receiverA1.instance.deep.path.value, 15, "#10");
        assert.equal(receiverA2.instance.deep.path.value, 15, "#11");

        emmiterB.instance = emmiterA.instance;

        emmiterB.instance.name = "A to C";

        assert.equal(receiverA1.instance.deep.path.value, 15, "#11");
        assert.equal(receiverA2.instance.deep, emmiterB.instance.deep, "#12");
        assert.equal(receiverB1.instance.deep.path.value, 15, "#13");
        assert.equal(receiverB2.instance.deep, emmiterB.instance.deep, "#14");

        emmiterB.instance = { name: "new C", deep: { path: { value: 20 } } };

        assert.equal(receiverA1.instance.deep.path.value, 15, "#15");
        assert.equal(receiverA2.instance.deep, emmiterA.instance.deep, "#16");
        assert.equal(receiverB1.instance.deep.path.value, 20, "#17");
        assert.equal(receiverB2.instance.deep, emmiterB.instance.deep, "#18");

        emmiterA.instance.deep.path.value = 30;
        emmiterB.instance.deep.path.value = 40;

        assert.equal(receiverA1.instance.deep.path.value, 30, "#19");
        assert.equal(receiverA2.instance.deep.path.value, 30, "#20");
        assert.equal(receiverB1.instance.deep.path.value, 40, "#21");
        assert.equal(receiverB2.instance.deep.path.value, 40, "#22");

        (emmiterA.instance as Nullable) = null;

        assert.equal(receiverA1.instance.deep.path.value, undefined, "#23");
        assert.equal(receiverA2.instance.deep, undefined, "#24");

        emmiterA.instance = { name: "new A old null", deep: { path: { value: 10 } } };

        assert.equal(receiverA1.instance.deep.path.value, 10, "#25");
        assert.equal(receiverA2.instance.deep, emmiterA.instance.deep, "#26");
    }

    @test @shouldPass
    public observeTwoWayEdgeCase(): void
    {
        const left  = { instance: { name: "left.instance.deep.path.value: 1",  deep: { path: { id: 1, value: 1 } } } };
        const right = { instance: { name: "right.instance.deep.path.value: 2", deep: { path: { id: 2, value: 2 } } } };

        Metadata.from(left);
        Metadata.from(right);

        Reactive.observeTwoWay(left, "instance.deep.path.value", right.instance.deep, "path.value".split("."));

        assert.isTrue(left.instance.deep.path.value == right.instance.deep.path.value, "#01 - left.instance.deep.path.value should be equal to right.instance.deep.path.value");

        left.instance.deep.path.value = 5;

        assert.isTrue(left.instance.deep.path.value == right.instance.deep.path.value, "#03 - left.instance.deep.path.value changed. right.instance.deep.path.value should have same value");

        right.instance.deep.path.value = 6;

        assert.isTrue(left.instance.deep.path.value == right.instance.deep.path.value, "#04 - right.instance.deep.path.value changed. left.instance.deep.path.value should have same value");

        left.instance = { name: "left[new instance].deep.path.value: 10", deep: { path: { id: 1, value: 10 } } };

        assert.isTrue(left.instance.deep.path.value == right.instance.deep.path.value, "#05 - right.instance.deep.path.value should be equal left[new instance].deep.path.value");

        right.instance.deep.path = { id: 2, value: 15 };

        assert.isTrue(left.instance.deep.path.value == right.instance.deep.path.value, "#06 - left.instance.deep.path.value should be equal to right.instance.deep[new path].value");

        (left.instance as Nullable) = null;

        assert.equal(left.instance, null, "#07");
        assert.equal(right.instance.deep.path.value, undefined, "#08 - right.instance.deep.path.value should be undefined");

        left.instance = { name: "left[old null, new instance].deep.path.value: 30", deep: { path: { id: 1, value: 30 } } };

        assert.isTrue(left.instance.deep.path.value == right.instance.deep.path.value, "#09 - right.instance.deep.path.value should be equal to left[old null, new instance].deep.path.value");
    }

    @test @shouldPass
    public observeCrossTwoWay(): void
    {
        const leftA  = { instance: { name: "leftA.instance.deep.path.value: 1",  deep: { path: { id: 1, value: 1 } } } };
        const rightA = { instance: { name: "rightA.instance.deep.path.value: 2", deep: { path: { id: 2, value: 2 } } } };
        const leftB  = { instance: { name: "leftB.instance.deep.path.value: 3",  deep: { path: { id: 3, value: 3 } } } };
        const rightB = { instance: { name: "rightB.instance.deep.path.value: 4", deep: { path: { id: 4, value: 4 } } } };

        Reactive.observeTwoWay(leftA, "instance.deep.path.value", rightA.instance.deep, "path.value");
        Reactive.observeTwoWay(leftB, "instance.deep.path.value", rightB.instance.deep, "path.value");

        assert.isTrue(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#01 - leftA.instance.deep.path.value should be equal to rightA.instance.deep.path.value");
        assert.isTrue(leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#02 - leftB.instance.deep.path.value should be equal to rightB.instance.deep.path.value");

        leftA.instance.deep.path.value = 5;

        assert.isTrue(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#03 - leftA.instance.deep.path.value changed. rightA.instance.deep.path.value should have same value");

        rightA.instance.deep.path.value = 6;

        assert.isTrue(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#04 - rightA.instance.deep.path.value changed. leftA.instance.deep.path.value should have same value");

        leftB.instance.deep.path.value = 7;

        assert.isTrue(leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#05 - leftB.instance.deep.path.value changed. rightB.instance.deep.path.value should have same value");

        rightB.instance.deep.path.value = 8;

        assert.isTrue(leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#06 - rightB.instance.deep.path.value changed. leftB.instance.deep.path.value should have same value");

        leftB.instance = leftA.instance;

        assert.isTrue(leftA.instance.deep.path.value == rightA.instance.deep.path.value && leftA.instance.deep.path.value == leftB.instance.deep.path.value && leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#07 - Merged instance. Left A, Right A, Left B and Right B should have same value");

        leftA.instance = { name: "leftA[new instance].deep.path.value: 10", deep: { path: { id: 1, value: 10 } } };

        assert.equal(leftA.instance.deep.path.value, 10, "#07");
        assert.isTrue(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#08 - rightA.instance.deep.path.value should be equal leftA[new instance].deep.path.value");

        assert.equal(leftB.instance.deep.path.value, 6,  "#10 - leftB.instance.deep.path.value should not be affected leftA[new instance].deep.path.value");
        assert.equal(rightB.instance.deep.path.value, 6, "#11 - rightB.instance.deep.path.value should not be affected leftA[new instance].deep.path.value");

        rightA.instance.deep.path = { id: 2, value: 15 };
        leftB.instance = { name: "leftB[new instance].deep.path.value: 20", deep: { path: { id: 4, value: 20 } } };

        assert.isTrue(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#12 - leftA.instance.deep.path.value should be equal to rightA.instance.deep[new path].value");
        assert.isTrue(leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#13 - rightB.instance.deep.path.value should be equal leftB[new instance].deep.path.value");

        (leftA.instance as Nullable) = null;

        assert.equal(leftA.instance, null, "#14");
        assert.equal(rightA.instance.deep.path.value, undefined, "#15 - rightA.instance.deep.path.value should be undefined");
        assert.equal(leftB.instance.deep.path.value, 20,  "#16 - leftB.instance.deep.path.value should not be affected by leftA[instance = null]");
        assert.equal(rightB.instance.deep.path.value, 20, "#17 - rightB.instance.deep.path.value should not be affected by leftA[instance = null]");

        leftA.instance = { name: "leftA[old null, new instance].deep.path.value: 30", deep: { path: { id: 1, value: 30 } } };
        rightB.instance.deep.path = { id: 4, value: 40 };

        assert.isTrue(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#18 - rightA.instance.deep.path.value should be equal to leftA[old null, new instance].deep.path.value");
        assert.isTrue(leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#19 - leftB.instance.deep.path.value should be equal to rightB.instance.deep[new path].value");
    }

    @test @shouldPass
    public observeUnsubscribe(): void
    {
        const emmiter  = { instance: { name: "Emmiter",  value: 1 }};
        const receiver = { instance: { name: "Receiver", value: 2 }};

        const { subscription } = Reactive.observe(emmiter.instance, "value", { notify: x => receiver.instance.value = x });

        assert.isTrue(emmiter.instance.value == receiver.instance.value, "#1");

        emmiter.instance.value = 5;

        assert.equal(receiver.instance.value, 5, "#2");

        receiver.instance.value = 6;

        assert.equal(emmiter.instance.value, 5, "#3");

        subscription.unsubscribe();

        emmiter.instance.value = 10;

        assert.equal(receiver.instance.value, 6, "#2");
    }

    @test @shouldPass
    public observeUnsubscribeTwoWay(): void
    {
        const left  = { instance: { name: "left.instance.deep.path.value: 1",  deep: { path: { id: 1, value: 1 } } } };
        const right = { instance: { name: "right.instance.deep.path.value: 2", deep: { path: { id: 2, value: 2 } } } };

        const [leftSubscription, rightSubscription] = Reactive.observeTwoWay(left, "instance.deep.path.value", right.instance.deep, "path.value");

        assert.isTrue(left.instance.deep.path.value == right.instance.deep.path.value, "#01 - left.instance.deep.path.value should be equal to right.instance.deep.path.value");

        left.instance.deep.path.value = 5;

        assert.isTrue(left.instance.deep.path.value == right.instance.deep.path.value, "#03 - left.instance.deep.path.value changed. right.instance.deep.path.value should have same value");

        right.instance.deep.path.value = 6;

        assert.isTrue(left.instance.deep.path.value == right.instance.deep.path.value, "#04 - right.instance.deep.path.value changed. left.instance.deep.path.value should have same value");

        rightSubscription.unsubscribe();

        left.instance.deep.path.value = 7;

        assert.equal(left.instance.deep.path.value == right.instance.deep.path.value, false, "#05 - left.instance.deep.path.value changed. right.instance.deep.path.value should not be affected");

        right.instance.deep.path.value = 8;

        assert.isTrue(left.instance.deep.path.value == right.instance.deep.path.value, "#06 - right.instance.deep.path.value changed. left.instance.deep.path.value should have same value");

        leftSubscription.unsubscribe();

        right.instance.deep.path.value = 9;

        assert.equal(left.instance.deep.path.value == right.instance.deep.path.value, false, "#05 - right.instance.deep.path.value changed. left.instance.deep.path.value should not be affected");
    }

    @test @shouldPass
    public dispose(): void
    {
        const left  = { a: { value: 1 } };
        const right = { a: { value: 1 } };

        Reactive.observeTwoWay(left, ["a", "value"], right, ["a", "value"]);

        left.a.value = 2;

        assert.equal(left.a.value, right.a.value);

        Reactive.dispose({ }); // Coverage

        Metadata.from(left).disposables.push({ dispose: () => undefined }); // Coverage

        Reactive.dispose(left);

        left.a.value = 1;

        assert.notEqual(left.a.value, right.a.value);
    }

    @test @shouldFail
    public observeInvalidPath(): void
    {
        const emmiter = { instance: { name: "left.instance.deep.path.value: 1",  deep: { path: { id: 1, value: 1 } } } };

        assert.throws(() => Reactive.observe(emmiter, "instance.deep1.path.value", { notify: () => null }));
    }

    @test @shouldFail
    public notifyNotReactiveTarget(): void
    {
        assert.throws(() => Reactive.notify({ }, "value"), "Target is not reactive");
    }
}
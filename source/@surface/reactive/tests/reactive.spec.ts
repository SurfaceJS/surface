import { Nullable }                            from "@surface/core";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import * as chai                               from "chai";
import Reactive                                from "..";
import Reactor                                 from "../internal/reactor";
import { REACTOR }                             from "../internal/symbols";

@suite
export default class ReactiveSpec
{
    @test @shouldPass
    public getReactor(): void
    {
        const emmiter  = { instance: { name: "Emmiter",  value: 1 }};
        const receiver = { instance: { name: "Receiver", value: 2 }};

        Reactive.observe(emmiter.instance, "value", { notify: x => receiver.instance.value = x });

        const reactor = Reactive.getReactor(emmiter.instance);

        chai.expect(reactor).to.instanceOf(Reactor);
    }

    @test @shouldPass
    public hasObserver(): void
    {
        const emmiter  = { instance: { name: "Emmiter",  value: 1 }};
        const receiver = { instance: { name: "Receiver", value: 2 }};

        chai.expect(Reactive.hasObserver(emmiter.instance, "value")).to.equal(false);

        Reactive.observe(emmiter.instance, "value", { notify: x => receiver.instance.value = x });

        chai.expect(Reactive.hasObserver(emmiter.instance, "value")).to.equal(true);
    }

    @test @shouldPass
    public observeProperty(): void
    {
        const emmiter   = { instance: { name: "Emmiter",  value: 1 }};
        const receiverA = { instance: { name: "Receiver A", value: 2 }};
        const receiverB = { instance: { name: "Receiver B", value: 2 }};

        Reactive.observe(emmiter.instance, "value", { notify: x => receiverA.instance.value = x });
        Reactive.observe(emmiter.instance, "value", { notify: x => receiverB.instance.value = x });

        chai.expect(emmiter.instance.value == receiverA.instance.value, "#1").to.equal(true);
        chai.expect(emmiter.instance.value == receiverB.instance.value, "#1").to.equal(true);

        emmiter.instance.value = 5;

        chai.expect(receiverA.instance.value, "#2").to.equal(5);
        chai.expect(receiverB.instance.value, "#2").to.equal(5);

        receiverA.instance.value = 6;
        receiverB.instance.value = 6;

        chai.expect(emmiter.instance.value, "#3").to.equal(5);
    }

    @test @shouldPass
    public observePropertyArray(): void
    {
        const emmiter  = { instance: { name: "Emmiter",  elements: [{ value: 1 }] }};
        const receiver = { instance: { name: "Receiver", elements: [{ value: 2 }] }};

        Reactive.observe(emmiter.instance, "elements.0.value", { notify: (x: number) => receiver.instance.elements[0].value = x });

        chai.expect(emmiter.instance.elements[0].value == receiver.instance.elements[0].value, "#1").to.equal(true);

        emmiter.instance.elements[0].value = 5;

        chai.expect(receiver.instance.elements[0].value, "#2").to.equal(5);

        receiver.instance.elements[0].value = 6;

        chai.expect(emmiter.instance.elements[0].value, "#3").to.equal(5);
    }

    @test @shouldPass
    public observePropertyWithOutterReceiver(): void
    {
        const emmiter  = { instance: { name: "Emmiter",  value: 1 }};
        const receiver = { instance: { name: "Receiver", value: 2 }};

        const listener = { notify: (x: number) => receiver.instance.value = x };

        const [, observer] = Reactive.observe(emmiter, "instance.value");

        observer.subscribe(listener);

        chai.expect(emmiter.instance.value == receiver.instance.value, "#1").to.equal(false);

        emmiter.instance.value = 5;

        chai.expect(receiver.instance.value, "#2").to.equal(5);

        receiver.instance.value = 6;

        chai.expect(emmiter.instance.value, "#3").to.equal(5);
    }

    @test @shouldPass
    public observePropertyLazySubscription(): void
    {
        const emmiter  = { instance: { name: "Emmiter",  value: 1 }};
        const receiver = { instance: { name: "Receiver", value: 2 }};

        const observer = Reactive.observe(emmiter.instance, "value")[1];

        observer.subscribe({ notify: x => receiver.instance.value = x });

        chai.expect(emmiter.instance.value == receiver.instance.value, "#1").to.equal(false);

        observer.notify(emmiter.instance.value);

        chai.expect(emmiter.instance.value == receiver.instance.value, "#2").to.equal(true);

        emmiter.instance.value = 5;

        chai.expect(receiver.instance.value, "#3").to.equal(5);

        receiver.instance.value = 6;

        chai.expect(emmiter.instance.value, "#4").to.equal(5);
    }

    @test @shouldPass
    public observeStringPath(): void
    {
        const emmiter  = { instance: { name: "Emmiter A", deep: { path: { value: 1 } } } };
        const receiver = { instance: { name: "Receiver A", deep: { path: { value: 1 } } } };

        Reactive.observe(emmiter.instance, "deep.path.value", { notify: (x: number) => receiver.instance.deep.path.value = x });

        chai.expect(emmiter.instance.deep.path.value == receiver.instance.deep.path.value, "#1").to.equal(true);

        emmiter.instance.deep.path.value = 5;

        chai.expect(receiver.instance.deep.path.value, "#2").to.equal(5);

        receiver.instance.deep.path.value = 6;

        chai.expect(emmiter.instance.deep.path.value, "#3").to.equal(5);
    }

    @test @shouldPass
    public observeArrayPath(): void
    {
        const emmiter  = { instance: { name: "Emmiter A", deep: { path: { value: 1 } } } };
        const receiver = { instance: { name: "Receiver A", deep: { path: { value: 1 } } } };

        Reactive.observe(emmiter.instance, "deep.path.value".split("."), { notify: (x: number) => receiver.instance.deep.path.value = x });

        chai.expect(emmiter.instance.deep.path.value == receiver.instance.deep.path.value, "#1").to.equal(true);

        emmiter.instance.deep.path.value = 5;

        chai.expect(receiver.instance.deep.path.value, "#2").to.equal(5);

        receiver.instance.deep.path.value = 6;

        chai.expect(emmiter.instance.deep.path.value, "#3").to.equal(5);
    }

    @test @shouldPass
    public observeTwoWayStringPath(): void
    {
        const emmiter  = { instance: { name: "Emmiter A", deep: { path: { value: 1 } } } };
        const receiver = { instance: { name: "Receiver A", deep: { path: { value: 1 } } } };

        Reactive.observeTwoWay(emmiter.instance, "deep.path.value", receiver.instance, "deep.path.value");

        chai.expect(emmiter.instance.deep.path.value == receiver.instance.deep.path.value, "#1").to.equal(true);

        emmiter.instance.deep.path.value = 5;

        chai.expect(receiver.instance.deep.path.value, "#2").to.equal(5);

        receiver.instance.deep.path.value = 6;

        chai.expect(emmiter.instance.deep.path.value, "#3").to.equal(6);
    }

    @test @shouldPass
    public observeTwoWayArrayPath(): void
    {
        const emmiter  = { instance: { name: "Emmiter A", deep: { path: { value: 1 } } } };
        const receiver = { instance: { name: "Receiver A", deep: { path: { value: 1 } } } };

        Reactive.observeTwoWay(emmiter.instance, "deep.path.value".split("."), receiver.instance, "deep.path.value".split("."));

        chai.expect(emmiter.instance.deep.path.value == receiver.instance.deep.path.value, "#1").to.equal(true);

        emmiter.instance.deep.path.value = 5;

        chai.expect(receiver.instance.deep.path.value, "#2").to.equal(5);

        receiver.instance.deep.path.value = 6;

        chai.expect(emmiter.instance.deep.path.value, "#3").to.equal(6);
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

        chai.expect(receiverA1.instance.deep.path.value, "#01").to.equal(1);
        chai.expect(receiverA2.instance.deep.path.value, "#02").to.equal(1);
        chai.expect(receiverA2.instance.deep, "#02").to.equal(emmiterA.instance.deep);

        chai.expect(receiverB1.instance.deep.path.value, "#03").to.equal(2);
        chai.expect(receiverB2.instance.deep.path.value, "#04").to.equal(2);
        chai.expect(receiverB2.instance.deep, "#04").to.equal(emmiterB.instance.deep);

        emmiterA.instance.deep.path.value = 5;

        chai.expect(receiverA1.instance.deep.path.value, "#05").to.equal(5);

        receiverA1.instance.deep.path.value = 6;

        chai.expect(emmiterA.instance.deep.path.value, "#06").to.equal(5);

        receiverA2.instance.deep = { path: { value: 6 } };

        chai.expect(emmiterA.instance.deep.path.value, "#07").to.equal(5);

        emmiterA.instance = { name: "new A", deep: { path: { value: 10 } } };

        chai.expect(receiverA1.instance.deep.path.value, "#08").to.equal(10);
        chai.expect(receiverA2.instance.deep, "#09").to.equal(emmiterA.instance.deep);

        emmiterA.instance.deep.path.value = 15;

        chai.expect(receiverA1.instance.deep.path.value, "#10").to.equal(15);
        chai.expect(receiverA2.instance.deep.path.value, "#11").to.equal(15);

        emmiterB.instance = emmiterA.instance;

        emmiterB.instance.name = "A to C";

        chai.expect(receiverA1.instance.deep.path.value, "#11").to.equal(15);
        chai.expect(receiverA2.instance.deep, "#12").to.equal(emmiterB.instance.deep);
        chai.expect(receiverB1.instance.deep.path.value, "#13").to.equal(15);
        chai.expect(receiverB2.instance.deep, "#14").to.equal(emmiterB.instance.deep);

        emmiterB.instance = { name: "new C", deep: { path: { value: 20 } } };

        chai.expect(receiverA1.instance.deep.path.value, "#15").to.equal(15);
        chai.expect(receiverA2.instance.deep, "#16").to.equal(emmiterA.instance.deep);
        chai.expect(receiverB1.instance.deep.path.value, "#17").to.equal(20);
        chai.expect(receiverB2.instance.deep, "#18").to.equal(emmiterB.instance.deep);

        emmiterA.instance.deep.path.value = 30;
        emmiterB.instance.deep.path.value = 40;

        chai.expect(receiverA1.instance.deep.path.value, "#19").to.equal(30);
        chai.expect(receiverA2.instance.deep.path.value, "#20").to.equal(30);
        chai.expect(receiverB1.instance.deep.path.value, "#21").to.equal(40);
        chai.expect(receiverB2.instance.deep.path.value, "#22").to.equal(40);

        (emmiterA.instance as Nullable) = null;

        chai.expect(receiverA1.instance.deep.path.value, "#23").to.equal(30);
        chai.expect(receiverA2.instance.deep.path.value, "#24").to.equal(30);

        emmiterA.instance = { name: "new A old null", deep: { path: { value: 10 } } };

        chai.expect(receiverA1.instance.deep.path.value, "#25").to.equal(10);
        chai.expect(receiverA2.instance.deep, "#26").to.equal(emmiterA.instance.deep);
    }

    @test @shouldPass
    public observeTwoWayEdgeCase(): void
    {
        const left  = { instance: { name: "left.instance.deep.path.value: 1",  deep: { path: { id: 1, value: 1 } } } };
        const right = { instance: { name: "right.instance.deep.path.value: 2", deep: { path: { id: 2, value: 2 } } } };

        const extractReactor = (target: Object & { [REACTOR]?: Reactor }) => target[REACTOR];

        extractReactor(left);
        extractReactor(right);

        Reactive.observeTwoWay(left, "instance.deep.path.value", right.instance.deep, "path.value".split("."));

        chai.expect(left.instance.deep.path.value == right.instance.deep.path.value, "#01 - left.instance.deep.path.value should be equal to right.instance.deep.path.value").to.equal(true);

        left.instance.deep.path.value = 5;

        chai.expect(left.instance.deep.path.value == right.instance.deep.path.value, "#03 - left.instance.deep.path.value changed. right.instance.deep.path.value should have same value").to.equal(true);

        right.instance.deep.path.value = 6;

        chai.expect(left.instance.deep.path.value == right.instance.deep.path.value, "#04 - right.instance.deep.path.value changed. left.instance.deep.path.value should have same value").to.equal(true);

        left.instance = { name: "left[new instance].deep.path.value: 10", deep: { path: { id: 1, value: 10 } } };

        chai.expect(left.instance.deep.path.value == right.instance.deep.path.value, "#05 - right.instance.deep.path.value should be equal left[new instance].deep.path.value").to.equal(true);

        right.instance.deep.path = { id: 2, value: 15 };

        chai.expect(left.instance.deep.path.value == right.instance.deep.path.value, "#06 - left.instance.deep.path.value should be equal to right.instance.deep[new path].value").to.equal(true);

        (left.instance as Nullable) = null;

        chai.expect(left.instance, "#07").to.equal(null);
        chai.expect(right.instance.deep.path.value, "#08 - right.instance.deep.path.value should not be affected by left[instance = null]").to.equal(15);

        left.instance = { name: "left[old null, new instance].deep.path.value: 30", deep: { path: { id: 1, value: 30 } } };

        chai.expect(left.instance.deep.path.value == right.instance.deep.path.value, "#09 - right.instance.deep.path.value should be equal to left[old null, new instance].deep.path.value").to.equal(true);
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

        chai.expect(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#01 - leftA.instance.deep.path.value should be equal to rightA.instance.deep.path.value").to.equal(true);
        chai.expect(leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#02 - leftB.instance.deep.path.value should be equal to rightB.instance.deep.path.value").to.equal(true);

        leftA.instance.deep.path.value = 5;

        chai.expect(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#03 - leftA.instance.deep.path.value changed. rightA.instance.deep.path.value should have same value").to.equal(true);

        rightA.instance.deep.path.value = 6;

        chai.expect(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#04 - rightA.instance.deep.path.value changed. leftA.instance.deep.path.value should have same value").to.equal(true);

        leftB.instance.deep.path.value = 7;

        chai.expect(leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#05 - leftB.instance.deep.path.value changed. rightB.instance.deep.path.value should have same value").to.equal(true);

        rightB.instance.deep.path.value = 8;

        chai.expect(leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#06 - rightB.instance.deep.path.value changed. leftB.instance.deep.path.value should have same value").to.equal(true);

        leftB.instance = leftA.instance;

        chai.expect(leftA.instance.deep.path.value == rightA.instance.deep.path.value && leftA.instance.deep.path.value == leftB.instance.deep.path.value && leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#07 - Merged instance. Left A, Right A, Left B and Right B should have same value").to.equal(true);

        leftA.instance = { name: "leftA[new instance].deep.path.value: 10", deep: { path: { id: 1, value: 10 } } };

        chai.expect(leftA.instance.deep.path.value, "#07").to.equal(10);
        chai.expect(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#08 - rightA.instance.deep.path.value should be equal leftA[new instance].deep.path.value").to.equal(true);

        chai.expect(leftB.instance.deep.path.value,  "#10 - leftB.instance.deep.path.value should not be affected leftA[new instance].deep.path.value").to.equal(6);
        chai.expect(rightB.instance.deep.path.value, "#11 - rightB.instance.deep.path.value should not be affected leftA[new instance].deep.path.value").to.equal(6);

        const oldRightAInstanceDeep = rightA.instance.deep.path;

        chai.expect(oldRightAInstanceDeep);

        rightA.instance.deep.path = { id: 2, value: 15 };
        leftB.instance = { name: "leftB[new instance].deep.path.value: 20", deep: { path: { id: 4, value: 20 } } };

        chai.expect(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#12 - leftA.instance.deep.path.value should be equal to rightA.instance.deep[new path].value").to.equal(true);
        chai.expect(leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#13 - rightB.instance.deep.path.value should be equal leftB[new instance].deep.path.value").to.equal(true);

        (leftA.instance as Nullable) = null;

        chai.expect(leftA.instance, "#14").to.equal(null);
        chai.expect(rightA.instance.deep.path.value, "#15 - rightA.instance.deep.path.value should not be affected by leftA[instance = null]").to.equal(15);
        chai.expect(leftB.instance.deep.path.value,  "#16 - leftB.instance.deep.path.value should not be affected by leftA[instance = null]").to.equal(20);
        chai.expect(rightB.instance.deep.path.value, "#17 - rightB.instance.deep.path.value should not be affected by leftA[instance = null]").to.equal(20);

        leftA.instance = { name: "leftA[old null, new instance].deep.path.value: 30", deep: { path: { id: 1, value: 30 } } };
        rightB.instance.deep.path = { id: 4, value: 40 };

        chai.expect(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#18 - rightA.instance.deep.path.value should be equal to leftA[old null, new instance].deep.path.value").to.equal(true);
        chai.expect(leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#19 - leftB.instance.deep.path.value should be equal to rightB.instance.deep[new path].value").to.equal(true);
    }

    @test @shouldPass
    public observeUnsubscribe(): void
    {
        const emmiter  = { instance: { name: "Emmiter",  value: 1 }};
        const receiver = { instance: { name: "Receiver", value: 2 }};

        const subscription = Reactive.observe(emmiter.instance, "value", { notify: x => receiver.instance.value = x })[2];

        chai.expect(emmiter.instance.value == receiver.instance.value, "#1").to.equal(true);

        emmiter.instance.value = 5;

        chai.expect(receiver.instance.value, "#2").to.equal(5);

        receiver.instance.value = 6;

        chai.expect(emmiter.instance.value, "#3").to.equal(5);

        subscription.unsubscribe();

        emmiter.instance.value = 10;

        chai.expect(receiver.instance.value, "#2").to.equal(6);
    }

    @test @shouldPass
    public observeUnsubscribeTwoWay(): void
    {
        const left  = { instance: { name: "left.instance.deep.path.value: 1",  deep: { path: { id: 1, value: 1 } } } };
        const right = { instance: { name: "right.instance.deep.path.value: 2", deep: { path: { id: 2, value: 2 } } } };

        const [leftSubscription, rightSubscription] = Reactive.observeTwoWay(left, "instance.deep.path.value", right.instance.deep, "path.value");

        chai.expect(left.instance.deep.path.value == right.instance.deep.path.value, "#01 - left.instance.deep.path.value should be equal to right.instance.deep.path.value").to.equal(true);

        left.instance.deep.path.value = 5;

        chai.expect(left.instance.deep.path.value == right.instance.deep.path.value, "#03 - left.instance.deep.path.value changed. right.instance.deep.path.value should have same value").to.equal(true);

        right.instance.deep.path.value = 6;

        chai.expect(left.instance.deep.path.value == right.instance.deep.path.value, "#04 - right.instance.deep.path.value changed. left.instance.deep.path.value should have same value").to.equal(true);

        rightSubscription.unsubscribe();

        left.instance.deep.path.value = 7;

        chai.expect(left.instance.deep.path.value == right.instance.deep.path.value, "#05 - left.instance.deep.path.value changed. right.instance.deep.path.value should not be affected").to.equal(false);

        right.instance.deep.path.value = 8;

        chai.expect(left.instance.deep.path.value == right.instance.deep.path.value, "#06 - right.instance.deep.path.value changed. left.instance.deep.path.value should have same value").to.equal(true);

        leftSubscription.unsubscribe();

        right.instance.deep.path.value = 9;

        chai.expect(left.instance.deep.path.value == right.instance.deep.path.value, "#05 - right.instance.deep.path.value changed. left.instance.deep.path.value should not be affected").to.equal(false);
    }

    @test @shouldFail
    public observeInvalidPath(): void
    {
        const emmiter = { instance: { name: "left.instance.deep.path.value: 1",  deep: { path: { id: 1, value: 1 } } } };

        chai.expect(() => Reactive.observe(emmiter, "instance.deep1.path.value", { notify: () => null })).to.throw();
    }
}
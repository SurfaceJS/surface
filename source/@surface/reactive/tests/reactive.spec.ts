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
        const emmiter  = { instance: { name: "Emmiter",  value: 1 }};
        const listener = { instance: { name: "Listener", value: 2 }};

        Reactive.observeProperty(emmiter.instance, "value", x => listener.instance.value = x);

        chai.expect(emmiter.instance.value == listener.instance.value, "#1").to.equal(true);

        emmiter.instance.value = 5;

        chai.expect(emmiter.instance.value == listener.instance.value, "#2").to.equal(true);

        listener.instance.value = 6;

        chai.expect(emmiter.instance.value == listener.instance.value, "#3").to.equal(false);
    }

    @test
    public observePath(): void
    {
        const emmiterA  = { instance: { name: "Emmiter A", deep: { path: { value: 1 } } } };
        const emmiterB  = { instance: { name: "Emmiter B", deep: { path: { value: 2 } } } };

        const listenerA1 = { instance: { name: "Listener A", deep: { path: { value: 1 } } } };
        const listenerA2 = { instance: { name: "Listener C", deep: { path: { value: 3 } } } };
        const listenerB1 = { instance: { name: "Listener B", deep: { path: { value: 2 } } } };
        const listenerB2 = { instance: { name: "Listener D", deep: { path: { value: 4 } } } };

        Reactive.observePath(emmiterA, "instance.deep.path.value", x => listenerA1.instance.deep.path.value = x as number);
        Reactive.observePath(emmiterA, "instance.deep",            x => listenerA2.instance.deep = x as typeof listenerA2["instance"]["deep"]);
        Reactive.observePath(emmiterB, "instance.deep.path.value", x => listenerB1.instance.deep.path.value = x as number);
        Reactive.observePath(emmiterB, "instance.deep",            x => listenerB2.instance.deep = x as typeof listenerA2["instance"]["deep"]);

        chai.expect(listenerA1.instance.deep.path.value, "#01").to.equal(1);
        chai.expect(listenerA2.instance.deep.path.value, "#02").to.equal(1);

        chai.expect(listenerB1.instance.deep.path.value, "#03").to.equal(2);
        chai.expect(listenerB2.instance.deep.path.value, "#04").to.equal(2);

        emmiterA.instance.deep.path.value = 5;

        chai.expect(listenerA1.instance.deep.path.value, "#05").to.equal(5);

        listenerA1.instance.deep.path.value = 6;

        chai.expect(emmiterA.instance.deep.path.value, "#06").to.equal(5);

        listenerA2.instance.deep = { path: { value: 6 }};

        chai.expect(emmiterA.instance.deep.path.value, "#07").to.equal(5);

        emmiterA.instance = { name: "new A", deep: { path: { value: 10 } } };

        chai.expect(listenerA1.instance.deep.path.value, "#08").to.equal(10);
        chai.expect(listenerA2.instance.deep.path.value, "#09").to.equal(10);

        emmiterA.instance.deep.path.value = 15;

        chai.expect(listenerA1.instance.deep.path.value, "#10").to.equal(15);
        chai.expect(listenerA2.instance.deep.path.value, "#11").to.equal(15);

        emmiterB.instance = emmiterA.instance;

        emmiterB.instance.name = "A to C";

        chai.expect(listenerA1.instance.deep.path.value, "#11").to.equal(15);
        chai.expect(listenerA2.instance.deep.path.value, "#12").to.equal(15);
        chai.expect(listenerB1.instance.deep.path.value, "#13").to.equal(15);
        chai.expect(listenerB2.instance.deep.path.value, "#14").to.equal(15);

        emmiterB.instance = { name: "new C", deep: { path: { value: 20 } } };

        chai.expect(listenerA1.instance.deep.path.value, "#15").to.equal(15);
        chai.expect(listenerA2.instance.deep.path.value, "#16").to.equal(15);
        chai.expect(listenerB1.instance.deep.path.value, "#17").to.equal(20);
        chai.expect(listenerB2.instance.deep.path.value, "#18").to.equal(20);

        emmiterA.instance.deep.path.value = 30;
        emmiterB.instance.deep.path.value = 40;

        chai.expect(listenerA1.instance.deep.path.value, "#19").to.equal(30);
        chai.expect(listenerA2.instance.deep.path.value, "#20").to.equal(30);
        chai.expect(listenerB1.instance.deep.path.value, "#21").to.equal(40);
        chai.expect(listenerB2.instance.deep.path.value, "#22").to.equal(40);

        (emmiterA.instance as Nullable) = null;

        chai.expect(listenerA1.instance.deep.path.value, "#23").to.equal(30);
        chai.expect(listenerA2.instance.deep.path.value, "#24").to.equal(30);

        emmiterA.instance = { name: "new A old null", deep: { path: { value: 10 } } };

        chai.expect(listenerA1.instance.deep.path.value, "#25").to.equal(10);
        chai.expect(listenerA2.instance.deep.path.value, "#26").to.equal(10);
    }

    @test
    public observeTwoWay(): void
    {
        const leftA  = { instance: { name: "Left A",  deep: { path: { value: 1 } } } };
        const rightA = { instance: { name: "Right B", deep: { path: { value: 2 } } } };
        const leftB  = { instance: { name: "Left A",  deep: { path: { value: 3 } } } };
        const rightB = { instance: { name: "Right B", deep: { path: { value: 4 } } } };

        Reactive.observeTwoWay(leftA, "instance.deep.path.value", rightA, "instance.deep.path.value");
        Reactive.observeTwoWay(leftB, "instance.deep.path.value", rightB, "instance.deep.path.value");

        chai.expect(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#01").to.equal(true);
        chai.expect(leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#02").to.equal(true);

        leftA.instance.deep.path.value = 5;

        chai.expect(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#03").to.equal(true);

        rightA.instance.deep.path.value = 6;

        chai.expect(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#04").to.equal(true);

        leftB.instance.deep.path.value = 7;

        chai.expect(leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#05").to.equal(true);

        rightB.instance.deep.path.value = 8;

        chai.expect(leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#06").to.equal(true);

        rightB.instance = leftA.instance;

        leftA.instance = { name: "new instance in left A", deep: { path: { value: 10 } } };

        chai.expect(leftA.instance.deep.path.value, "#07").to.equal(10);
        chai.expect(rightA.instance.deep.path.value, "#08").to.equal(10);

        rightB.instance.deep.path.value = 5;

        chai.expect(leftB.instance.deep.path.value, "#09").to.equal(5);
        chai.expect(rightB.instance.deep.path.value, "#10").to.equal(5);

        leftA.instance.deep.path = rightB.instance.deep.path;

        chai.expect(leftA.instance.deep.path.value == rightA.instance.deep.path.value && leftA.instance.deep.path.value == leftB.instance.deep.path.value, "#08").to.equal(true);

        rightB.instance.deep.path = leftA.instance.deep.path;

        leftA.instance.deep.path = { value: 15 };
        rightB.instance = { name: "new instance in right B", deep: { path: { value: 20 } } };

        chai.expect(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#11").to.equal(true);
        chai.expect(leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#12").to.equal(true);

        (leftA.instance as Nullable) = null;

        chai.expect(leftA.instance, "#13").to.equal(null);
        chai.expect(rightA.instance.deep.path.value, "#14").to.equal(15);
        chai.expect(leftB.instance.deep.path.value, "#15").to.equal(20);
        chai.expect(rightB.instance.deep.path.value, "#16").to.equal(20);

        leftA.instance.deep.path  = { value: 30 };
        rightB.instance.deep.path = { value: 40 };

        chai.expect(leftA.instance.deep.path.value == rightA.instance.deep.path.value, "#17").to.equal(true);
        chai.expect(leftB.instance.deep.path.value == rightB.instance.deep.path.value, "#18").to.equal(true);
    }
}
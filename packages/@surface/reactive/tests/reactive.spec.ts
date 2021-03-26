import { DisposableMetadata, Hookable }                            from "@surface/core";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                    from "chai";
import computed                                from "../internal/decorators/computed.js";
import notify                                  from "../internal/decorators/notify.js";
import Metadata from "../internal/metadata.js";
import Reactive                                from "../internal/reactive.js";

@suite
export default class ReactiveSpec
{
    @test @shouldPass
    public observeProperty(): void
    {
        const target = { value: 1 };

        let receiver = 0;

        Reactive.from(target, ["value"]).subscribe(x => receiver = x as number);

        target.value = 2;

        chai.assert.equal(target.value, receiver);
    }

    @test @shouldPass
    public observePath(): void
    {
        const target   = { a: { b: { c: { value: 0 } } } };
        let   receiver = 0;

        Reactive.from(target, ["a", "b", "c", "value"]).subscribe(x => receiver = x as number);

        target.a.b.c.value = 1;

        chai.assert.equal(target.a.b.c.value, receiver);

        const c = target.a.b.c;

        target.a.b.c = { value: 2 };

        c.value = 3;

        chai.assert.equal(target.a.b.c.value, receiver, "target.a.b.c.value equal to receiver #1");
        chai.assert.notEqual(c.value, receiver, "c.value not equal receiver");

        const b = target.a.b;

        target.a.b = { c: { value: 4 } };

        b.c = { value: 5 };

        chai.assert.equal(target.a.b.c.value, receiver, "target.a.b.c.value equal to receiver #2");
        chai.assert.notEqual(b.c.value, receiver, "b.c.value not equal receiver");

        const a = target.a;

        target.a = { b: { c: { value: 6 } } };

        a.b = { c: { value: 7 } };

        chai.assert.equal(target.a.b.c.value, receiver, "target.a.b.c.value equal to receiver #3");
        chai.assert.notEqual(a.b.c.value, receiver, "a.b.c.value not equal receiver");
    }

    @test @shouldPass
    public observePathOfNonObjectType(): void
    {
        const target   = { value: "" };
        let   receiver = 0;

        Reactive.from(target, ["value", "length"]).subscribe(x => receiver = x as number);

        target.value = "Hello World!!!";

        chai.assert.equal(target.value.length, receiver);
    }

    @test @shouldPass
    public reobserve(): void
    {
        const target   = { a: { value: 1 } };

        let receiver1 = 0;
        let receiver2 = 0;

        Reactive.from(target, ["a", "value"]).subscribe(x => receiver1 = x as number);
        Reactive.from(target, ["a", "value"]).subscribe(x => receiver2 = x as number);

        target.a.value = 2;

        chai.assert.equal(target.a.value, receiver1);
        chai.assert.equal(target.a.value, receiver2);

        target.a = { value: 1 };

        chai.assert.equal(target.a.value, receiver1);
        chai.assert.equal(target.a.value, receiver2);
    }

    @test @shouldPass
    public reobserveNestedPaths(): void
    {
        const target   = { a: { b: { c: { value: 0 } } } };

        let valueReceiver = 0;
        let aReceiver     = { b: { c: { value: 0 } } };
        let bReceiver     = { c: { value: 0 } };

        Reactive.from(target, ["a"]).subscribe(x => aReceiver = x as typeof aReceiver);
        Reactive.from(target, ["a", "b", "c", "value"]).subscribe(x => valueReceiver = x as number);
        Reactive.from(target, ["a", "b"]).subscribe(x => bReceiver = x as typeof bReceiver);

        target.a.b = { c: { value: 1 } };

        chai.assert.equal(target.a.b.c.value, valueReceiver);
        chai.assert.equal(target.a.b, bReceiver);

        target.a = { b: { c: { value: 1 } } };

        chai.assert.equal(target.a.b.c.value, valueReceiver);
        chai.assert.equal(target.a.b,         bReceiver);
        chai.assert.equal(target.a,           aReceiver);
    }

    @test @shouldPass
    public observeNestedPaths(): void
    {
        const target = { a: { b: { c: { value: 0 } } } };
        const c      = target.a.b.c;

        let abcValueReceiver = 0;
        let cValueReceiver   = 0;

        Reactive.from(target, ["a", "b", "c", "value"]).subscribe(x => abcValueReceiver = x as typeof abcValueReceiver);
        Reactive.from(c, ["value"]).subscribe(x => cValueReceiver = x as typeof cValueReceiver);

        target.a.b.c.value = 1;

        chai.assert.equal(target.a.b.c.value, abcValueReceiver);
        chai.assert.equal(cValueReceiver, c.value);

        target.a.b.c = { value: 2 };

        c.value = 3;

        chai.assert.equal(target.a.b.c.value, abcValueReceiver);
        chai.assert.equal(cValueReceiver, c.value);
        chai.assert.notEqual(target.a.b.c.value, c.value);
    }

    @test @shouldPass
    public observeArray(): void
    {
        const target = [1, 2];

        let receiver0 = target[0];
        let receiver1 = target[1];
        let length    = target.length;

        Reactive.from(target, ["0"]).subscribe(x => receiver0 = x as number);
        Reactive.from(target, ["1"]).subscribe(x => receiver1 = x as number);
        Reactive.from(target, ["length"]).subscribe(x => length = x as number);

        target[0] = 3;
        target[1] = 4;

        chai.assert.equal(target[0], receiver0);
        chai.assert.equal(target[1], receiver1);
        chai.assert.equal(target.length, length);

        target.unshift(5);

        chai.assert.equal(target[0], receiver0);
        chai.assert.equal(target[1], receiver1);
        chai.assert.equal(target.length, length);

        target.pop();

        chai.assert.equal(target[0], receiver0);
        chai.assert.equal(target[1], receiver1);
        chai.assert.equal(target.length, length);

        target.pop();

        chai.assert.equal(target[0], receiver0);
        chai.assert.notEqual(target[1], receiver1);
        chai.assert.equal(target.length, length);

        target.push(6);

        chai.assert.equal(target[0], receiver0);
        chai.assert.notEqual(target[1], receiver1);
        chai.assert.equal(target.length, length);

        target[1] = 7;

        chai.assert.equal(target[0], receiver0);
        chai.assert.notEqual(target[1], receiver1);
        chai.assert.equal(target.length, length);

        target.reverse();

        chai.assert.equal(target[0], receiver0);
        chai.assert.notEqual(target[1], receiver1);
        chai.assert.equal(target.length, length);
    }

    @test @shouldPass
    public observeArrayNestedPath(): void
    {
        const target = [{ value: 1 }];

        let receiver = target[0].value;

        Reactive.from(target, ["0", "value"]).subscribe(x => receiver = x as number);

        chai.assert.equal(target[0].value, receiver);

        target.unshift({ value: 2 });

        chai.assert.equal(target[0].value, receiver);

        target.shift();

        chai.assert.equal(target[0].value, receiver);
    }

    @test @shouldPass
    public observeSpreadedRoot(): void
    {
        const target = { value: 1 };

        let receiver = target.value;

        Reactive.from(target, ["value"]).subscribe(x => receiver = x as typeof receiver);

        chai.assert.equal(target.value, receiver);

        target.value = 2;

        chai.assert.equal(target.value, receiver);

        const newTarget = { ...target };

        let newReceiver = 0;

        newTarget.value = 3;

        chai.assert.notEqual(newTarget.value, receiver);

        Reactive.from(newTarget, ["value"]).subscribe(x => newReceiver = x as typeof newReceiver);

        newTarget.value = 4;

        chai.assert.equal(newTarget.value, newReceiver);
    }

    @test @shouldPass
    public notify(): void
    {
        Reactive.notify({ }); // Coverage

        const target = { a: 1, b: 1 };

        let aReceiver = 0;
        let bReceiver = 0;

        Reactive.from(target, ["a"]).subscribe(x => aReceiver = x as number);
        Reactive.from(target, ["b"]).subscribe(x => bReceiver = x as number);

        Reactive.notify(target, ["a"]);
        Reactive.notify(target, ["c"]); // Coverage

        chai.assert.equal(target.a, aReceiver);
        chai.assert.notEqual(target.b, bReceiver);

        Reactive.notify(target);

        chai.assert.equal(target.a, aReceiver);
        chai.assert.equal(target.b, bReceiver);
    }

    @test @shouldPass
    public decoratorComputed(): void
    {
        @Hookable.finisher
        class Target
        {
            private a: number = 0;
            private b: number = 0;

            @computed(["a"], ["b"])
            public get sum(): number
            {
                return this.a + this.b;
            }

            public recalculate(): void
            {
                this.a = Math.ceil(Math.random() * 100);
                this.b = Math.ceil(Math.random() * 100);
            }
        }

        const target = new Target();

        let receiver = 0;

        Reactive.from(target, ["sum"]).subscribe(x => receiver = x as number);

        target.recalculate();

        chai.assert.equal(target.sum, receiver);
    }

    @test @shouldPass
    public decoratorNotify(): void
    {
        @Hookable.finisher
        class Target
        {
            @notify("sum")
            private a: number = 0;

            @notify("sum")
            private b: number = 0;

            public get sum(): number
            {
                return this.a + this.b;
            }

            public recalculate(): void
            {
                this.a = Math.ceil(Math.random() * 100);
                this.b = Math.ceil(Math.random() * 100);
            }
        }

        const target = new Target();

        let receiver = 0;

        Reactive.from(target, ["sum"]).subscribe(x => receiver = x as number);

        target.recalculate();

        chai.assert.equal(target.sum, receiver);
    }

    @test @shouldPass
    public dispose(): void
    {
        const property = { a: { value: 1 } };

        const target1 = { property };

        Reactive.from(target1, ["property", "a", "value"]);

        const propertyMetadata  = Metadata.from(target1.property);
        const propertyAMetadata = Metadata.from(target1.property.a);

        chai.assert.equal(propertyMetadata.subjects.get("a")!.size, 1);
        chai.assert.equal(propertyAMetadata.subjects.get("value")!.size, 1);

        DisposableMetadata.from(target1).dispose();

        chai.assert.equal(propertyMetadata.subjects.get("a")!.size, 0);
        chai.assert.equal(propertyAMetadata.subjects.get("value")!.size, 0);
    }

    @test @shouldFail
    public observeStrictPath(): void
    {
        const target: { a?: { b?: { c?: { value: 1 } } }  } = { a: { } };

        chai.assert.throws(() => Reactive.from(target, ["a", "b", "c", "value"]));

        target.a = { b: { c: { value: 1 } } };

        Reactive.from(target, ["a", "b", "c", "value"]);

        chai.assert.throws(() => target.a = { });
    }
}
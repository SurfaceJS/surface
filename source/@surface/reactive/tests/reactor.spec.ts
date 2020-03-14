import { tuple }                               from "@surface/core/common/generic";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                              from "chai";
import Reactive                                from "..";
import { notify, observable }                  from "../decorators";
import Reactor                                 from "../internal/reactor";
import { REACTOR, TRACKED_KEYS }               from "../internal/symbols";
import Observer                                from "../observer";
import PropertySubscription                    from "../property-subscription";

@suite
export default class ReactorSpec
{
    @test @shouldPass
    public makeReactive(): void
    {
        class Emitter
        {
            private _value: number = 0;

            public [TRACKED_KEYS]: Array<string> = [];

            public get value(): number
            {
                return this._value;
            }

            public set value(value: number)
            {
                this._value = value;
            }

            public getValue(): number
            {
                return this._value;
            }
        }

        @observable
        class ReadonlyEmitter
        {
            @notify("value")
            private _value: number = 0;

            public [TRACKED_KEYS]: Array<string> = [];

            public get value(): number
            {
                return this._value;
            }

            public get nonReactiveValue(): number
            {
                return this._value;
            }

            public changeValue(): void
            {
                this._value = 1;
            }
        }

        let instanceEmmiterGetValueListener = () => 0;
        let instanceEmmiterValueListener    = 0;
        let instanceReadonlyValueListener   = 0;
        let rawEmmiterValueListerner        = 0;

        const instanceEmmiter         = new Emitter();
        const instanceReadonlyEmmiter = new ReadonlyEmitter();
        const rawEmmiter              = { value: 0, nonReactiveValue: 1, [TRACKED_KEYS]: [] };

        Object.defineProperty(rawEmmiter, "nonReactiveValue", { value: 1, writable: false });

        const instanceEmmiterGetValueObserver = new Observer<() => number>();
        const instanceEmmiterValueObserver    = new Observer<number>();
        const instanceReadonlyEmmiterObserver = new Observer<number>();
        const rawEmmiterValueObserver         = new Observer<number>();

        instanceEmmiterGetValueObserver.subscribe({ notify: x => instanceEmmiterGetValueListener = x });
        instanceReadonlyEmmiterObserver.subscribe({ notify: x => instanceReadonlyValueListener = x });
        instanceEmmiterValueObserver.subscribe({ notify: x => instanceEmmiterValueListener = x });
        rawEmmiterValueObserver.subscribe({ notify: x => rawEmmiterValueListerner = x });

        Reactor.makeReactive(instanceEmmiter, "getValue").observers.set("getValue", instanceEmmiterGetValueObserver);
        Reactor.makeReactive(instanceEmmiter, "value").observers.set("value", instanceEmmiterValueObserver);
        Reactor.makeReactive(instanceReadonlyEmmiter, "nonReactiveValue");
        Reactor.makeReactive(instanceReadonlyEmmiter, "value").observers.set("value", instanceReadonlyEmmiterObserver);
        Reactor.makeReactive(rawEmmiter, "nonReactiveValue");
        Reactor.makeReactive(rawEmmiter, "value").observers.set("value", rawEmmiterValueObserver);

        assert.doesNotThrow(() => Reactor.makeReactive(rawEmmiter, "value"));

        assert.deepEqual(instanceEmmiter[TRACKED_KEYS],         ["getValue", "value"]);
        assert.deepEqual(instanceReadonlyEmmiter[TRACKED_KEYS], ["_value", "nonReactiveValue", "value"]);
        assert.deepEqual(rawEmmiter[TRACKED_KEYS],              ["nonReactiveValue", "value"]);

        rawEmmiter.value = rawEmmiter.value;

        rawEmmiter.value = 1;

        assert.equal(rawEmmiterValueListerner, rawEmmiter.value);

        instanceEmmiter.value = instanceEmmiter.value;

        instanceEmmiter.value = 1;

        assert.equal(instanceEmmiterValueListener, 1);

        instanceEmmiter.getValue = () => 3;

        assert.equal(instanceEmmiterGetValueListener, instanceEmmiter.getValue);

        instanceReadonlyEmmiter.changeValue();
        instanceReadonlyEmmiter.changeValue();

        assert.equal(instanceReadonlyValueListener, instanceReadonlyEmmiter.value);
    }

    @test @shouldPass
    public makeReactiveArray(): void
    {
        const emmiter  = { values: tuple({ value: 0 }, [{ value: 0 }]) };
        const listener = { values: tuple({ value: 0 }, [{ value: 0 }]) };

        const values0Observer       = new Observer<{ value: number }>();
        const values1Observer       = new Observer<[{ value: number }]>();
        const values01Observer      = new Observer<{ value: number }>();
        const values01ValueObserver = new Observer<number>();

        values0Observer.subscribe({ notify: x => listener.values[0] = x });
        values1Observer.subscribe({ notify: x => listener.values[1] = x });
        values01Observer.subscribe({ notify: x => listener.values[1][0] = x });
        values01ValueObserver.subscribe({ notify: x => listener.values[1][0].value = x });

        Reactor.makeReactive(emmiter.values, 0).observers.set("0", values0Observer);
        Reactor.makeReactive(emmiter.values, 1).observers.set("1", values1Observer);
        Reactor.makeReactive(emmiter.values[1], 0).observers.set("0", values01Observer);
        Reactor.makeReactive(emmiter.values[1][0], "value").observers.set("value", values01ValueObserver);

        assert.instanceOf(Reactive.getReactor(emmiter.values),       Reactor);
        assert.instanceOf(Reactive.getReactor(emmiter.values[1]),    Reactor);
        assert.instanceOf(Reactive.getReactor(emmiter.values[1][0]), Reactor);

        emmiter.values[1][0].value = 1;

        assert.deepEqual(listener.values[1][0].value, emmiter.values[1][0].value);

        emmiter.values[1][0] = { value: 2 };

        assert.deepEqual(listener.values[1][0], emmiter.values[1][0]);

        emmiter.values[1] = [{ value: 3 }];

        assert.deepEqual(listener.values[1], emmiter.values[1]);

        emmiter.values[0] = { value: 4 };

        assert.deepEqual(listener.values[0], emmiter.values[0]);

        emmiter.values[1].pop();

        assert.deepEqual(listener.values, [{ value: 4 }, []]);

        emmiter.values.pop();

        assert.deepEqual(listener.values, [{ value: 4 }, []]);

        emmiter.values.pop();

        assert.deepEqual(listener.values, [{ value: 4 }, []]);
    }

    @test @shouldPass
    public getSetDependency(): void
    {
        const emmiter = { a: { b: 1 } };

        const reactorA = Reactor.makeReactive(emmiter,   "a");
        const reactorB = Reactor.makeReactive(emmiter.a, "b");

        reactorA.dependencies.set("a", reactorB);

        assert.equal(reactorA.dependencies.get("a"), reactorB);
    }

    @test @shouldPass
    public getSetObserver(): void
    {
        const emmiter = { a: { b: 1 } };

        const reactor = Reactor.makeReactive(emmiter, "a");

        const observer = new Observer();

        reactor.observers.set("a", new Observer());

        assert.deepEqual(reactor.observers.get("a"), observer);
    }

    @test @shouldPass
    public notify(): void
    {
        const emmiter  = { value: 1 };
        const receiver = { value: 1 };

        const reactor = Reactor.makeReactive(emmiter, "value");

        const observer = new Observer<number>();

        observer.subscribe({ notify: (x: number) => receiver.value = x });

        reactor.observers.set("value", observer);

        reactor.notify(null);

        assert.equal(receiver.value, 1);

        reactor.notify(emmiter, "value", null as unknown as number);

        assert.equal(receiver.value, 1);

        reactor.notify({ value: 2 });

        assert.equal(receiver.value, 2);

        reactor.notify(emmiter, "value");

        assert.equal(receiver.value, 1);

        reactor.notify(emmiter, "value", 3);

        assert.equal(receiver.value, 3);
    }

    @test @shouldPass
    public notifyDependency(): void
    {
        const emmiter  = { a: { b: { value: 1 } } };
        const receiver = { value: 1 };

        const reactorA = Reactor.makeReactive(emmiter, "a");
        const reactorB = Reactor.makeReactive(emmiter.a, "b");
        const reactor  = Reactor.makeReactive(emmiter.a.b, "value");

        reactorA.dependencies.set("a", reactorB);
        reactorB.dependencies.set("b", reactor);

        const observer = new Observer<number>();

        observer.subscribe({ notify: x => receiver.value = x });

        reactor.observers.set("value", observer);

        reactorA.notify({ a: { b: { value: 2 } }});

        assert.equal(receiver.value, 2);
    }

    @test @shouldPass
    public notifyRegistries(): void
    {
        const emmiterA  = { a: { b: { value: 1 } } };
        const emmiterB  = { a: { b: { value: 2 } } };
        const receiverA = { value: 1 };
        const receiverB = { value: 1 };

        const emmiterAReactorA     = Reactor.makeReactive(emmiterA, "a");
        const emmiterAReactorB     = Reactor.makeReactive(emmiterA.a, "b");
        const emmiterAReactorValue = Reactor.makeReactive(emmiterA.a.b, "value");

        const receiverAObserver = new Observer<number>();

        receiverAObserver.subscribe({ notify: x => receiverA.value = x });

        emmiterAReactorA.dependencies.set("a", emmiterAReactorB);
        emmiterAReactorB.dependencies.set("b", emmiterAReactorValue);
        emmiterAReactorValue.observers.set("value", receiverAObserver);

        const emmiterBReactorA     = Reactor.makeReactive(emmiterB, "a");
        const emmiterBReactorB     = Reactor.makeReactive(emmiterB.a, "b");
        const emmiterBReactorValue = Reactor.makeReactive(emmiterB.a.b, "value");

        const receiverBObserver = new Observer<number>();

        receiverAObserver.subscribe({ notify: x => receiverA.value = x });

        emmiterBReactorA.dependencies.set("a", emmiterBReactorB);
        emmiterBReactorB.dependencies.set("b", emmiterBReactorValue);
        emmiterBReactorValue.observers.set("value", receiverBObserver);

        const oldA = emmiterA.a;

        emmiterA.a = emmiterB.a;

        assert.equal(oldA.b.value, 1, "#01");

        assert.equal(receiverA.value, 2, "#02");
        assert.equal(receiverB.value, 1, "#03");

        emmiterA.a.b.value = 3;

        assert.equal(receiverA.value, 3, "#04");
        assert.equal(receiverB.value, 1, "#05");

        emmiterA.a = oldA;

        assert.equal(emmiterB.a.b.value, 3, "#06");

        assert.equal(receiverA.value, 1, "#07");
        assert.equal(receiverB.value, 1, "#08");

        emmiterAReactorA.notify({ a: { b: { value: 4 } }});

        assert.equal(receiverA.value, 4, "#09");
        assert.equal(receiverB.value, 1, "#10");

        emmiterAReactorB.notify({ b: { value: 5 } });

        assert.equal(receiverA.value, 5, "#11");
        assert.equal(receiverB.value, 1, "#12");

        emmiterAReactorValue.notify({ value: 6 });

        assert.equal(receiverA.value, 6, "#13");
        assert.equal(receiverB.value, 1, "#14");

        emmiterA.a.b.value = 7;

        assert.equal(receiverA.value, 7, "#15");
        assert.equal(receiverB.value, 1, "#16");
    }

    @test @shouldPass
    public notifyPropertySubscription(): void
    {
        const emmiter  = { host: { a: { value: 1 } } };
        const receiver = { host: { a: { value: 1 } } };

        const reactor = Reactor.makeReactive(emmiter.host.a, "value");

        const listener = { notify: (x: number) => receiver.host.a.value = x, update: (x: typeof emmiter["host"]) => receiver.host = x };
        const observer = new Observer<number>();

        observer.subscribe(listener);

        const subscription = new PropertySubscription(listener, observer);

        reactor.setPropertySubscription("a", subscription);
        reactor.setPropertySubscription("a", new PropertySubscription({ notify: () => null, update: () => null }, new Observer()));

        reactor.notify({ a: { value: 2 } });

        assert.equal(receiver.host.a.value, 2);

        reactor.notify(emmiter.host, "a");

        assert.equal(receiver.host.a.value, 1);

        reactor.notify(emmiter.host, "a", { value: 2 });

        assert.equal(receiver.host.a.value, 1);
    }

    @test @shouldPass
    public update(): void
    {
        const emmiter  = { a: { b: { value: 1 } } };

        const reactorA = Reactor.makeReactive(emmiter, "a");
        const reactorB = Reactor.makeReactive(emmiter.a, "b");
        const reactor  = Reactor.makeReactive(emmiter.a.b, "value");

        const observerA = new Observer();
        const observerB = new Observer();
        const observer  = new Observer();

        reactorA.observers.set("a", observerA);
        reactorB.observers.set("b", observerB);
        reactor.observers.set("value", observer);

        reactorA.dependencies.set("a", reactorB);
        reactorB.dependencies.set("b", reactor);

        const newValue = { b: { value: 1, [REACTOR]: undefined }, [REACTOR]: undefined };

        reactorA.update("a", newValue);
        reactorA.update("a", newValue);
        reactorA.update("a", null);

        assert.notEqual(newValue[REACTOR], undefined);
        assert.notEqual(newValue.b[REACTOR], undefined);
    }

    @test @shouldFail
    public makeReactiveInvalidKey(): void
    {
        assert.throw(() => Reactor.makeReactive({ } as { foo?: unknown }, "foo"), "Key foo does not exists on type Object");
    }
}
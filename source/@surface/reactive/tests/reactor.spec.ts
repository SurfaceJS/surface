import { tuple }                               from "@surface/core/common/generic";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import * as chai                               from "chai";
import Reactive                                from "..";
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

        class ReadonlyEmitter
        {
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

        Reactor.makeReactive(instanceEmmiter, "getValue").setObserver("getValue", instanceEmmiterGetValueObserver);
        Reactor.makeReactive(instanceEmmiter, "value").setObserver("value", instanceEmmiterValueObserver);
        Reactor.makeReactive(instanceReadonlyEmmiter, "nonReactiveValue");
        Reactor.makeReactive(instanceReadonlyEmmiter, "value").setObserver("value", instanceReadonlyEmmiterObserver);
        Reactor.makeReactive(rawEmmiter, "nonReactiveValue");
        Reactor.makeReactive(rawEmmiter, "value").setObserver("value", rawEmmiterValueObserver);

        chai.expect(() => Reactor.makeReactive(rawEmmiter, "value")).to.not.throw();
        chai.expect(instanceEmmiter[TRACKED_KEYS]).to.deep.equal(["getValue", "value"]);
        chai.expect(instanceReadonlyEmmiter[TRACKED_KEYS]).to.deep.equal(["nonReactiveValue", "value"]);
        chai.expect(rawEmmiter[TRACKED_KEYS]).to.deep.equal(["nonReactiveValue", "value"]);

        rawEmmiter.value = rawEmmiter.value;

        rawEmmiter.value = 1;

        chai.expect(rawEmmiterValueListerner).to.equal(rawEmmiter.value);

        instanceEmmiter.value = instanceEmmiter.value;

        instanceEmmiter.value = 1;

        chai.expect(instanceEmmiterValueListener).to.equal(1);

        instanceEmmiter.getValue = () => 3;

        chai.expect(instanceEmmiterGetValueListener).to.equal(instanceEmmiter.getValue);

        instanceReadonlyEmmiter.changeValue();
        instanceReadonlyEmmiter.changeValue();

        chai.expect(instanceReadonlyValueListener).to.equal(instanceReadonlyEmmiter.value);
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

        Reactor.makeReactive(emmiter.values, 0).setObserver("0", values0Observer);
        Reactor.makeReactive(emmiter.values, 1).setObserver("1", values1Observer);
        Reactor.makeReactive(emmiter.values[1], 0).setObserver("0", values01Observer);
        Reactor.makeReactive(emmiter.values[1][0], "value").setObserver("value", values01ValueObserver);

        chai.expect(Reactive.getReactor(emmiter.values)).to.instanceOf(Reactor);
        chai.expect(Reactive.getReactor(emmiter.values[1])).to.instanceOf(Reactor);
        chai.expect(Reactive.getReactor(emmiter.values[1][0])).to.instanceOf(Reactor);

        emmiter.values[1][0].value = 1;

        chai.expect(listener.values[1][0].value).deep.equal(emmiter.values[1][0].value);

        emmiter.values[1][0] = { value: 2 };

        chai.expect(listener.values[1][0]).deep.equal(emmiter.values[1][0]);

        emmiter.values[1] = [{ value: 3 }];

        chai.expect(listener.values[1]).deep.equal(emmiter.values[1]);

        emmiter.values[0] = { value: 4 };

        chai.expect(listener.values[0]).deep.equal(emmiter.values[0]);

        emmiter.values[1].pop();

        chai.expect(listener.values).deep.equal([{ value: 4 }, []]);

        emmiter.values.pop();

        chai.expect(listener.values).deep.equal([{ value: 4 }, []]);

        emmiter.values.pop();

        chai.expect(listener.values).deep.equal([{ value: 4 }, []]);
    }

    @test @shouldPass
    public getSetDependency(): void
    {
        const emmiter = { a: { b: 1 } };

        const reactorA = Reactor.makeReactive(emmiter,   "a");
        const reactorB = Reactor.makeReactive(emmiter.a, "b");

        reactorA.setDependency("a", reactorB);

        chai.expect(reactorA.getDependency("a")).to.equal(reactorB);
    }

    @test @shouldPass
    public getSetObserver(): void
    {
        const emmiter = { a: { b: 1 } };

        const reactor = Reactor.makeReactive(emmiter, "a");

        const observer = new Observer();

        reactor.setObserver("a", new Observer());

        chai.expect(reactor.getObserver("a")).to.deep.equal(observer);
    }

    @test @shouldPass
    public notify(): void
    {
        const emmiter  = { value: 1 };
        const receiver = { value: 1 };

        const reactor = Reactor.makeReactive(emmiter, "value");

        const observer = new Observer<number>();

        observer.subscribe({ notify: (x: number) => receiver.value = x });

        reactor.setObserver("value", observer);

        reactor.notify(null);

        chai.expect(receiver.value).to.equal(1);

        reactor.notify(emmiter, "value", null as unknown as number);

        chai.expect(receiver.value).to.equal(1);

        reactor.notify({ value: 2 });

        chai.expect(receiver.value).to.equal(2);

        reactor.notify(emmiter, "value");

        chai.expect(receiver.value).to.equal(1);

        reactor.notify(emmiter, "value", 3);

        chai.expect(receiver.value).to.equal(3);
    }

    @test @shouldPass
    public notifyDependency(): void
    {
        const emmiter  = { a: { b: { value: 1 } } };
        const receiver = { value: 1 };

        const reactorA = Reactor.makeReactive(emmiter, "a");
        const reactorB = Reactor.makeReactive(emmiter.a, "b");
        const reactor  = Reactor.makeReactive(emmiter.a.b, "value");

        reactorA.setDependency("a", reactorB);
        reactorB.setDependency("b", reactor);

        const observer = new Observer<number>();

        observer.subscribe({ notify: x => receiver.value = x });

        reactor.setObserver("value", observer);

        reactorA.notify({ a: { b: { value: 2 } }});

        chai.expect(receiver.value).to.equal(2);
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

        emmiterAReactorA.setDependency("a", emmiterAReactorB);
        emmiterAReactorB.setDependency("b", emmiterAReactorValue);
        emmiterAReactorValue.setObserver("value", receiverAObserver);

        const emmiterBReactorA     = Reactor.makeReactive(emmiterB, "a");
        const emmiterBReactorB     = Reactor.makeReactive(emmiterB.a, "b");
        const emmiterBReactorValue = Reactor.makeReactive(emmiterB.a.b, "value");

        const receiverBObserver = new Observer<number>();

        receiverAObserver.subscribe({ notify: x => receiverA.value = x });

        emmiterBReactorA.setDependency("a", emmiterBReactorB);
        emmiterBReactorB.setDependency("b", emmiterBReactorValue);
        emmiterBReactorValue.setObserver("value", receiverBObserver);

        const oldA = emmiterA.a;

        emmiterA.a = emmiterB.a;

        chai.expect(oldA.b.value, "#01").to.equal(1);

        chai.expect(receiverA.value, "#02").to.equal(2);
        chai.expect(receiverB.value, "#03").to.equal(1);

        emmiterA.a.b.value = 3;

        chai.expect(receiverA.value, "#04").to.equal(3);
        chai.expect(receiverB.value, "#05").to.equal(1);

        emmiterA.a = oldA;

        chai.expect(emmiterB.a.b.value, "#06").to.equal(3);

        chai.expect(receiverA.value, "#07").to.equal(1);
        chai.expect(receiverB.value, "#08").to.equal(1);

        emmiterAReactorA.notify({ a: { b: { value: 4 } }});

        chai.expect(receiverA.value, "#09").to.equal(4);
        chai.expect(receiverB.value, "#10").to.equal(1);

        emmiterAReactorB.notify({ b: { value: 5 } });

        chai.expect(receiverA.value, "#11").to.equal(5);
        chai.expect(receiverB.value, "#12").to.equal(1);

        emmiterAReactorValue.notify({ value: 6 });

        chai.expect(receiverA.value, "#13").to.equal(6);
        chai.expect(receiverB.value, "#14").to.equal(1);

        emmiterA.a.b.value = 7;

        chai.expect(receiverA.value, "#15").to.equal(7);
        chai.expect(receiverB.value, "#16").to.equal(1);
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

        chai.expect(receiver.host.a.value).to.equal(2);

        reactor.notify(emmiter.host, "a");

        chai.expect(receiver.host.a.value).to.equal(1);

        reactor.notify(emmiter.host, "a", { value: 2 });

        chai.expect(receiver.host.a.value).to.equal(1);
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

        reactorA.setObserver("a", observerA);
        reactorB.setObserver("b", observerB);
        reactor.setObserver("value", observer);

        reactorA.setDependency("a", reactorB);
        reactorB.setDependency("b", reactor);

        const newValue = { b: { value: 1, [REACTOR]: undefined }, [REACTOR]: undefined };

        reactorA.update("a", newValue);
        reactorA.update("a", newValue);
        reactorA.update("a", null);

        chai.expect(newValue[REACTOR]).to.not.equal(undefined);
        chai.expect(newValue.b[REACTOR]).to.not.equal(undefined);
    }

    @test @shouldFail
    public makeReactiveInvalidKey(): void
    {
        chai.expect(() => Reactor.makeReactive({ } as { foo?: unknown }, "foo")).to.Throw("Key foo does not exists on type Object");
    }
}
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                              from "chai";
import Container                               from "../internal/container.js";
import { inject }                              from "../internal/decorators.js";
import Bar                                     from "./mocks/bar.js";
import Baz                                     from "./mocks/baz.js";
import Foo                                     from "./mocks/foo.js";
import InjectableMock                          from "./mocks/injectable-mock.js";

const SYMBOL_KEY = Symbol("symbol-key");

const container = new Container()
    .registerSingleton("bar", Bar)
    .registerSingleton("baz", Baz)
    .registerSingleton("foo", Foo)
    .registerSingleton(InjectableMock)
    .registerSingleton("factory", x => new InjectableMock(x.resolve("baz")))
    .registerSingleton("injectable-mock", InjectableMock)
    .registerSingleton(SYMBOL_KEY, InjectableMock);

@suite
export default class DependencyInjectionSpec
{
    @test @shouldPass
    public injectUnregisteredConstructor(): void
    {
        const instance = new Container().inject(class Mock { });

        assert.notEqual(instance, null, "instance notEqual null");
    }

    @test @shouldPass
    public injectUnregisteredInstance(): void
    {
        const instance = new Container().inject(new class Mock { }());

        assert.notEqual(instance, null, "instance notEqual null");
    }

    @test @shouldPass
    public registerSingleton(): void
    {
        class Mock { }

        const container = new Container()
            .registerSingleton(Mock);

        const instance = container.resolve(Mock);

        container.registerSingleton("key", instance);

        assert.equal(instance, container.resolve(Mock), "intance equal container.resolve(Mock)");
    }

    @test @shouldPass
    public registerTransient(): void
    {
        const key = "mock";
        class Mock { }

        const container = new Container()
            .registerTransient(Mock)
            .registerTransient(key, Mock);

        assert.notEqual(container.resolve(Mock), container.resolve(Mock), "container.resolve(Mock) notEqual container.resolve(Mock)");
        assert.notEqual(container.resolve(key), container.resolve(key), "container.resolve(key) notEqual container.resolve(key)");
    }

    @test @shouldPass
    public injectUsingConstructor(): void
    {
        const instance1 = container.inject(InjectableMock);
        const instance2 = container.resolve<InjectableMock>("injectable-mock");

        assert.notEqual(instance1, instance2, "instance1 notEqual instance2");
        assert.deepEqual(instance1.foo, instance2.foo, "instance1.foo deepEqual instance2.foo");
        assert.deepEqual(instance1.bar, instance2.bar, "instance1.bar deepEqual instance2.bar");
        assert.deepEqual(instance1.baz, instance2.baz, "instance1.baz deepEqual instance2.baz");
    }

    @test @shouldPass
    public resolveInstance(): void
    {
        const instance1 = container.inject(new InjectableMock(new Baz()));
        const instance2 = container.resolve<InjectableMock>("injectable-mock");

        assert.notEqual(instance1, instance2, "instance1 notEqual instance2");
        assert.equal(instance1.foo, instance2.foo, "instance1.foo equal instance2.foo");
        assert.equal(instance1.bar, instance2.bar, "instance1.bar equal instance2.bar");
        assert.notEqual(instance1.baz, instance2.baz, "instance1.baz notEqual instance2.baz");
    }

    @test @shouldPass
    public resolveFromStringKey(): void
    {
        const instance1 = container.resolve<InjectableMock>("injectable-mock");
        const instance2 = container.resolve<InjectableMock>("injectable-mock");

        assert.equal(instance1, instance2, "instance1 equal instance2");
        assert.equal(instance1.foo, instance2.foo, "instance1.foo equal instance2.foo");
        assert.equal(instance1.bar, instance2.bar, "instance1.bar equal instance2.bar");
        assert.equal(instance1.baz, instance2.baz, "instance1.baz equal instance2.baz");
    }

    @test @shouldPass
    public resolveFromSymbolKey(): void
    {
        const instance1 = container.resolve<InjectableMock>(SYMBOL_KEY);
        const instance2 = container.resolve<InjectableMock>(SYMBOL_KEY);

        assert.equal(instance1, instance2, "instance1 equal instance2");
        assert.equal(instance1.foo, instance2.foo, "instance1.foo equal instance2.foo");
        assert.equal(instance1.bar, instance2.bar, "instance1.bar equal instance2.bar");
        assert.equal(instance1.baz, instance2.baz, "instance1.baz equal instance2.baz");
    }

    @test @shouldPass
    public resolveFromConstructorKey(): void
    {
        const instance1 = container.resolve(InjectableMock);
        const instance2 = container.resolve(InjectableMock);

        assert.equal(instance1, instance2, "instance1 equal instance2");
        assert.equal(instance1.foo, instance2.foo, "instance1.foo equal instance2.foo");
        assert.equal(instance1.bar, instance2.bar, "instance1.bar equal instance2.bar");
        assert.equal(instance1.baz, instance2.baz, "instance1.baz equal instance2.baz");
    }

    @test @shouldPass
    public resolveFactory(): void
    {
        const instance1 = container.resolve<InjectableMock>("factory");
        const instance2 = container.resolve(InjectableMock);

        assert.notEqual(instance1, instance2, "instance1 equal instance2");
        assert.equal(instance1.foo, instance2.foo, "instance1.foo equal instance2.foo");
        assert.equal(instance1.bar, instance2.bar, "instance1.bar equal instance2.bar");
        assert.equal(instance1.baz, instance2.baz, "instance1.baz equal instance2.baz");
    }

    @test @shouldPass
    public merge(): void
    {
        class LeftA { }
        class LeftB { }
        class RightA { }
        class RightB { }

        const left = new Container()
            .registerSingleton(LeftA)
            .registerTransient(LeftB);

        const right = new Container()
            .registerSingleton(RightA)
            .registerTransient(RightB);

        const container = Container.merge(left, right);

        assert.instanceOf(container.resolve(LeftA), LeftA, "container.resolve(LeftA) instanceOf LeftA");
        assert.instanceOf(container.resolve(LeftB), LeftB, "container.resolve(LeftB) instanceOf LeftB");
        assert.instanceOf(container.resolve(RightA), RightA, "container.resolve(RightA) instanceOf RightA");
        assert.instanceOf(container.resolve(RightB), RightB, "container.resolve(RightB) instanceOf RightB");
    }

    @test @shouldFail
    public resolveInvalidKey(): void
    {
        assert.throws(() => container.resolve(class Foo { }), Error, "Cannot resolve entry for the key Foo");
        assert.throws(() => container.resolve(Symbol("s")),   Error, "Cannot resolve entry for the key Symbol(s)");
        assert.throws(() => container.resolve("$"),           Error, "Cannot resolve entry for the key $");
    }

    @test @shouldFail
    public resolveCircularity(): void
    {
        class MockA
        {
            @inject("mock-b")
            public readonly mock!: object;
        }

        class MockB
        {
            @inject(MockA)
            public readonly mock!: object;
        }

        const container = new Container()
            .registerSingleton(MockA)
            .registerSingleton("mock-b", MockB);

        assert.throws(() => container.resolve(MockA), Error, "Circularity dependency to the key: [function MockA]");
        assert.throws(() => container.resolve("mock-b"), Error, "Circularity dependency to the key: mock-b");
    }
}
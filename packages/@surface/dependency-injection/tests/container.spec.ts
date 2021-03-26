import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                    from "chai";
import Container                               from "../internal/container.js";
import inject                                  from "../internal/decorators/inject.js";
import Bar                                     from "./mocks/bar.js";
import Baz                                     from "./mocks/baz.js";
import Foo                                     from "./mocks/foo.js";
import InjectableMock                          from "./mocks/injectable-mock.js";
import Qux                                     from "./mocks/qux.js";

const SYMBOL_KEY = Symbol("symbol-key");

const container = new Container()
    .registerSingleton("bar", Bar)
    .registerSingleton("baz", Baz)
    .registerSingleton("foo", Foo)
    .registerSingleton("qux", Qux)
    .registerSingleton(InjectableMock)
    .registerSingleton("factory", x => new InjectableMock(x.resolve("foo"), x.resolve("bar")))
    .registerSingleton("injectable-mock", InjectableMock)
    .registerSingleton(SYMBOL_KEY, InjectableMock);

@suite
export default class DependencyInjectionSpec
{
    @test @shouldPass
    public injectUnregisteredConstructor(): void
    {
        const instance = new Container().inject(class Mock { });

        chai.assert.notEqual(instance, null, "instance notEqual null");
    }

    @test @shouldPass
    public injectUnregisteredInstance(): void
    {
        const instance = new Container().inject(new class Mock { }());

        chai.assert.notEqual(instance, null, "instance notEqual null");
    }

    @test @shouldPass
    public registerSingleton(): void
    {
        class Mock { }

        const container = new Container()
            .registerSingleton(Mock);

        const instance = container.resolve(Mock);

        container.registerSingleton("key", instance);

        chai.assert.equal(instance, container.resolve(Mock), "intance equal container.resolve(Mock)");
    }

    @test @shouldPass
    public registerTransient(): void
    {
        const key = "mock";
        class Mock { }

        const container = new Container()
            .registerTransient(Mock)
            .registerTransient(key, Mock);

        chai.assert.notEqual(container.resolve(Mock), container.resolve(Mock), "container.resolve(Mock) notEqual container.resolve(Mock)");
        chai.assert.notEqual(container.resolve(key), container.resolve(key), "container.resolve(key) notEqual container.resolve(key)");
    }

    @test @shouldPass
    public injectUsingConstructor(): void
    {
        const instance1 = container.inject(InjectableMock);

        chai.assert.instanceOf(instance1.foo, Foo);
        chai.assert.instanceOf(instance1.bar, Bar);
        chai.assert.instanceOf(instance1.baz, Baz);
        chai.assert.instanceOf(instance1.qux, Qux);

        const instance2 = container.resolve<InjectableMock>("injectable-mock");

        chai.assert.notEqual(instance1, instance2, "instance1 notEqual instance2");
        chai.assert.deepEqual(instance1.foo,             instance2.foo, "instance1.foo         deepEqual instance2.foo");
        chai.assert.deepEqual(instance1.foo.bar,         instance2.bar, "instance1.foo.bar     deepEqual instance2.bar");
        chai.assert.deepEqual(instance1.foo.bar.baz,     instance2.baz, "instance1.foo.bar.baz deepEqual instance2.baz");
        chai.assert.deepEqual(instance1.foo.bar.baz.qux, instance2.qux, "instance1.foo.bar.baz deepEqual instance2.baz");
        chai.assert.deepEqual(instance1.bar,             instance2.bar, "instance1.bar         deepEqual instance2.bar");
        chai.assert.deepEqual(instance1.baz,             instance2.baz, "instance1.baz         deepEqual instance2.baz");
        chai.assert.deepEqual(instance1.qux,             instance2.qux, "instance1.qux         deepEqual instance2.qux");
    }

    @test @shouldPass
    public resolveInheritance(): void
    {
        const propertyValue = { name: "property-value" };
        const baseValue     = { name: "base-value" };
        const derivedValue  = { name: "derived-value" };

        class Base
        {
            @inject(propertyValue.name)
            public property!: object;

            public constructor(@inject(baseValue.name) public value: object)
            { }
        }

        class Derived extends Base
        {
            public constructor(@inject(derivedValue.name) public value: object)
            {
                super(value);
            }
        }

        const container = new Container();

        container.registerSingleton(propertyValue.name, propertyValue);
        container.registerSingleton(baseValue.name, baseValue);
        container.registerSingleton(derivedValue.name, derivedValue);
        container.registerSingleton(Base);
        container.registerSingleton(Derived);

        chai.assert.equal(container.resolve(Base).value, baseValue);
        chai.assert.equal(container.resolve(Base).property, propertyValue);
        chai.assert.equal(container.resolve(Derived).value, derivedValue);
        chai.assert.equal(container.resolve(Derived).property, propertyValue);
    }

    @test @shouldPass
    public resolveInstance(): void
    {
        const instance1 = container.inject(new InjectableMock(new Foo(new Bar(new Baz(new Qux()))), new Bar(new Baz(new Qux()))));
        const instance2 = container.resolve<InjectableMock>("injectable-mock");

        chai.assert.notEqual(instance1, instance2, "instance1 notEqual instance2");
        chai.assert.equal(instance1.baz, instance2.baz, "instance1.baz equal instance2.baz");
        chai.assert.equal(instance1.qux, instance2.qux, "instance1.qux equal instance2.qux");
    }

    @test @shouldPass
    public resolveFromStringKey(): void
    {
        const instance1 = container.resolve<InjectableMock>("injectable-mock");
        const instance2 = container.resolve<InjectableMock>("injectable-mock");

        chai.assert.equal(instance1, instance2, "instance1 equal instance2");
        chai.assert.equal(instance1.foo, instance2.foo, "instance1.foo equal instance2.foo");
        chai.assert.equal(instance1.bar, instance2.bar, "instance1.bar equal instance2.bar");
        chai.assert.equal(instance1.baz, instance2.baz, "instance1.baz equal instance2.baz");
        chai.assert.equal(instance1.qux, instance2.qux, "instance1.qux equal instance2.qux");
    }

    @test @shouldPass
    public resolveFromSymbolKey(): void
    {
        const instance1 = container.resolve<InjectableMock>(SYMBOL_KEY);
        const instance2 = container.resolve<InjectableMock>(SYMBOL_KEY);

        chai.assert.equal(instance1, instance2, "instance1 equal instance2");
        chai.assert.equal(instance1.foo, instance2.foo, "instance1.foo equal instance2.foo");
        chai.assert.equal(instance1.baz, instance2.baz, "instance1.bar equal instance2.bar");
        chai.assert.equal(instance1.baz, instance2.baz, "instance1.baz equal instance2.baz");
        chai.assert.equal(instance1.qux, instance2.qux, "instance1.qux equal instance2.qux");
    }

    @test @shouldPass
    public resolveFromConstructorKey(): void
    {
        const instance1 = container.resolve(InjectableMock);
        const instance2 = container.resolve(InjectableMock);

        chai.assert.equal(instance1, instance2, "instance1 equal instance2");
        chai.assert.equal(instance1.foo, instance2.foo, "instance1.foo equal instance2.foo");
        chai.assert.equal(instance1.baz, instance2.baz, "instance1.bar equal instance2.bar");
        chai.assert.equal(instance1.baz, instance2.baz, "instance1.baz equal instance2.baz");
        chai.assert.equal(instance1.qux, instance2.qux, "instance1.qux equal instance2.qux");
    }

    @test @shouldPass
    public resolveFactory(): void
    {
        const instance1 = container.resolve<InjectableMock>("factory");
        const instance2 = container.resolve(InjectableMock);

        chai.assert.notEqual(instance1, instance2, "instance1 equal instance2");
        chai.assert.equal(instance1.foo, instance2.foo, "instance1.foo equal instance2.foo");
        chai.assert.equal(instance1.baz, instance2.baz, "instance1.bar equal instance2.bar");
        chai.assert.equal(instance1.baz, instance2.baz, "instance1.baz equal instance2.baz");
        chai.assert.equal(instance1.qux, instance2.qux, "instance1.qux equal instance2.qux");
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

        chai.assert.instanceOf(container.resolve(LeftA), LeftA, "container.resolve(LeftA) instanceOf LeftA");
        chai.assert.instanceOf(container.resolve(LeftB), LeftB, "container.resolve(LeftB) instanceOf LeftB");
        chai.assert.instanceOf(container.resolve(RightA), RightA, "container.resolve(RightA) instanceOf RightA");
        chai.assert.instanceOf(container.resolve(RightB), RightB, "container.resolve(RightB) instanceOf RightB");
    }

    @test @shouldFail
    public resolveInvalidKey(): void
    {
        chai.assert.throws(() => container.resolve(class Foo { }), Error, "Cannot resolve entry for the key Foo");
        chai.assert.throws(() => container.resolve(Symbol("s")),   Error, "Cannot resolve entry for the key Symbol(s)");
        chai.assert.throws(() => container.resolve("$"),           Error, "Cannot resolve entry for the key $");
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

        chai.assert.throws(() => container.resolve(MockA), Error, "Circularity dependency to the key: [function MockA]");
        chai.assert.throws(() => container.resolve("mock-b"), Error, "Circularity dependency to the key: mock-b");
    }
}
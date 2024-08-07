import type { IDisposable }                    from "@surface/core";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                              from "chai";
import Container                               from "../internal/container.js";
import inject                                  from "../internal/decorators/inject.js";
import provide                                 from "../internal/decorators/provide.js";
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

        assert.notEqual(instance, null, "instance notEqual null");
    }

    @test @shouldPass
    public injectUnregisteredInstance(): void
    {
        const instance = new Container().inject(new class Mock { }());

        assert.notEqual(instance, null, "instance notEqual null");
    }

    @test @shouldPass
    public registerScoped(): void
    {
        class MockD { }
        class MockC { }

        class MockB
        {
            public constructor
            (
                @inject(MockC) public c: MockC,
                @inject(MockD) public d: MockD,
            )
            { }
        }

        class MockA implements IDisposable
        {
            public constructor
            (
                @inject(MockB) public b: MockB,
                @inject(MockC) public c: MockC,
                @inject(MockD) public d: MockD,
            )
            { }

            public dispose(): void
            {
                return void 0;
            }
        }

        class Mock
        {
            public constructor
            (
                @inject(MockA) public a: MockA,
                @inject(MockB) public b: MockB,
                @inject(MockC) public c: MockC,
                @inject(MockD) public d: MockD,
            )
            { }
        }

        const container = new Container(new Container().registerScoped(MockD))
            .registerTransient(MockA)
            .registerSingleton(MockB)
            .registerScoped(MockC)
            .registerScoped("MockC", x => x.resolve(MockC));

        const instance1 = container.inject(Mock);
        const instance2 = container.inject(Mock);

        assert.notEqual(container.resolve(MockA), container.resolve(MockA), "container.resolve(MockA) notEqual container.resolve(MockA)");
        assert.equal(instance1.b,    instance2.b,   "instance1.a equal instance1.b");
        assert.equal(instance1.a.c,  instance1.b.c, "instance1.a.c equal instance1.b.c");
        assert.equal(instance1.a.d,  instance1.b.d, "instance1.a.d equal instance1.b.d");
        assert.notEqual(instance1.c, instance2.c,   "instance1.c notEqual instance2.c");
        assert.notEqual(instance1.d, instance2.d,   "instance1.d notEqual instance2.d");
    }

    @test @shouldPass
    public registerSingleton(): void
    {
        class Mock { }

        const container = new Container()
            .registerSingleton(Mock);

        const instance = container.resolve(Mock);

        container.registerSingleton("key", instance);

        assert.equal(instance, container.resolve(Mock), "instance equal container.resolve(Mock)");
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
    public createScope(): void
    {
        class MockD { }
        class MockC { }

        class MockB
        {
            public constructor
            (
                @inject(MockC) public c: MockC,
                @inject(MockD) public d: MockD,
            )
            { }
        }

        class MockA implements IDisposable
        {
            public constructor
            (
                @inject(MockB) public b: MockB,
                @inject(MockC) public c: MockC,
                @inject(MockD) public d: MockD,
            )
            { }

            public dispose(): void
            {
                return void 0;
            }
        }

        class Mock
        {
            public constructor
            (
                @inject(MockA) public a: MockA,
                @inject(MockB) public b: MockB,
                @inject(MockC) public c: MockC,
                @inject(MockD) public d: MockD,
            )
            { }
        }

        const scope = new Container(new Container().registerScoped(MockD))
            .registerTransient(MockA)
            .registerSingleton(MockB)
            .registerScoped(MockC)
            .registerScoped("MockC", x => x.resolve(MockC))
            .createScope();

        const instance1 = scope.inject(Mock);
        const instance2 = scope.inject(Mock);

        assert.notEqual(scope.resolve(MockA), scope.resolve(MockA), "scope.resolve(MockC) notEqual scope.resolve(MockC)");
        assert.equal(scope.resolve(MockB), scope.resolve(MockB), "scope.resolve(MockB) equal scope.resolve(MockB)");
        assert.equal(scope.resolve(MockC), scope.resolve(MockC), "scope.resolve(MockC) equal scope.resolve(MockC)");
        assert.equal(scope.resolve(MockD), scope.resolve(MockD), "scope.resolve(MockD) equal scope.resolve(MockD)");
        assert.equal(instance1.b,    instance2.b,   "instance1.a equal instance1.b");
        assert.equal(instance1.a.c,  instance1.b.c, "instance1.a.c equal instance1.b.c");
        assert.equal(instance1.a.d,  instance1.b.d, "instance1.a.d equal instance1.b.d");
        assert.notEqual(instance1.c, instance2.c,   "instance1.c notEqual instance2.c");
        assert.notEqual(instance1.d, instance2.d,   "instance1.d notEqual instance2.d");
    }

    @test @shouldPass
    public parent(): void
    {
        class Mock { }

        const parentContainer = new Container();
        const childContainer  = new Container(parentContainer);

        parentContainer.registerSingleton(Mock);

        assert.equal(childContainer.resolve(Mock), parentContainer.resolve(Mock));
    }

    @test @shouldPass
    public injectUsingConstructor(): void
    {
        const instance1 = container.inject(InjectableMock);

        assert.instanceOf(instance1.foo, Foo);
        assert.instanceOf(instance1.bar, Bar);
        assert.instanceOf(instance1.baz, Baz);
        assert.instanceOf(instance1.qux, Qux);

        const instance2 = container.resolve<InjectableMock>("injectable-mock");

        assert.notEqual(instance1, instance2, "instance1 notEqual instance2");
        assert.deepEqual(instance1.foo,             instance2.foo, "instance1.foo         deepEqual instance2.foo");
        assert.deepEqual(instance1.foo.bar,         instance2.bar, "instance1.foo.bar     deepEqual instance2.bar");
        assert.deepEqual(instance1.foo.bar.baz,     instance2.baz, "instance1.foo.bar.baz deepEqual instance2.baz");
        assert.deepEqual(instance1.foo.bar.baz.qux, instance2.qux, "instance1.foo.bar.baz deepEqual instance2.baz");
        assert.deepEqual(instance1.bar,             instance2.bar, "instance1.bar         deepEqual instance2.bar");
        assert.deepEqual(instance1.baz,             instance2.baz, "instance1.baz         deepEqual instance2.baz");
        assert.deepEqual(instance1.qux,             instance2.qux, "instance1.qux         deepEqual instance2.qux");
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
            public constructor(@inject(derivedValue.name) public override value: object)
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

        assert.equal(container.resolve(Base).value, baseValue);
        assert.equal(container.resolve(Base).property, propertyValue);
        assert.equal(container.resolve(Derived).value, derivedValue);
        assert.equal(container.resolve(Derived).property, propertyValue);
    }

    @test @shouldPass
    public resolveInstance(): void
    {
        const instance1 = container.inject(new InjectableMock(new Foo(new Bar(new Baz(new Qux()))), new Bar(new Baz(new Qux()))));
        const instance2 = container.resolve<InjectableMock>("injectable-mock");

        assert.notEqual(instance1, instance2, "instance1 notEqual instance2");
        assert.equal(instance1.baz, instance2.baz, "instance1.baz equal instance2.baz");
        assert.equal(instance1.qux, instance2.qux, "instance1.qux equal instance2.qux");
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
        assert.equal(instance1.qux, instance2.qux, "instance1.qux equal instance2.qux");
    }

    @test @shouldPass
    public resolveFromSymbolKey(): void
    {
        const instance1 = container.resolve<InjectableMock>(SYMBOL_KEY);
        const instance2 = container.resolve<InjectableMock>(SYMBOL_KEY);

        assert.equal(instance1, instance2, "instance1 equal instance2");
        assert.equal(instance1.foo, instance2.foo, "instance1.foo equal instance2.foo");
        assert.equal(instance1.baz, instance2.baz, "instance1.bar equal instance2.bar");
        assert.equal(instance1.baz, instance2.baz, "instance1.baz equal instance2.baz");
        assert.equal(instance1.qux, instance2.qux, "instance1.qux equal instance2.qux");
    }

    @test @shouldPass
    public resolveFromConstructorKey(): void
    {
        const instance1 = container.resolve(InjectableMock);
        const instance2 = container.resolve(InjectableMock);

        assert.equal(instance1, instance2, "instance1 equal instance2");
        assert.equal(instance1.foo, instance2.foo, "instance1.foo equal instance2.foo");
        assert.equal(instance1.baz, instance2.baz, "instance1.bar equal instance2.bar");
        assert.equal(instance1.baz, instance2.baz, "instance1.baz equal instance2.baz");
        assert.equal(instance1.qux, instance2.qux, "instance1.qux equal instance2.qux");
    }

    @test @shouldPass
    public resolveFactory(): void
    {
        const instance1 = container.resolve<InjectableMock>("factory");
        const instance2 = container.resolve(InjectableMock);

        assert.notEqual(instance1, instance2, "instance1 equal instance2");
        assert.equal(instance1.foo, instance2.foo, "instance1.foo equal instance2.foo");
        assert.equal(instance1.baz, instance2.baz, "instance1.bar equal instance2.bar");
        assert.equal(instance1.baz, instance2.baz, "instance1.baz equal instance2.baz");
        assert.equal(instance1.qux, instance2.qux, "instance1.qux equal instance2.qux");
    }

    @test @shouldPass
    public provider(): void
    {
        class RootA { }
        class RootB implements IDisposable
        {
            public dispose(): void
            {
                return void 0;
            }
        }
        class A { }
        class B { }

        const root = new Container()
            .registerTransient(RootA)
            .registerScoped(RootB);

        const parent = new Container()
            .registerTransient(B);

        const container = new Container(parent)
            .registerSingleton(RootA, A)
            .registerTransient(A);

        @provide(container)
        class Mock
        {
            @inject(RootA)
            public rootA!: RootA;

            @inject(RootB)
            public rootB!: RootB;

            @inject(A)
            public a!: A;

            @inject(B)
            public b!: B;
        }

        const instance = root.inject(Mock);

        assert.instanceOf(instance.rootA, A, "instance.rootA instanceOf RootA");
        assert.instanceOf(instance.rootB, RootB, "instance.rootB instanceOf RootB");
        assert.instanceOf(instance.a, A, "instance.a instanceOf A");
        assert.instanceOf(instance.b, B, "instance.b instanceOf B");
    }

    @test @shouldPass
    public dispose(): void
    {
        const container = new Container();

        class Mock implements IDisposable
        {
            public disposed: boolean = false;
            public dispose(): void
            {
                this.disposed = true;
            }
        }

        container.registerSingleton(Mock);

        const instance = container.resolve(Mock);

        assert.isFalse(instance.disposed);

        container.dispose();

        assert.isTrue(instance.disposed);
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

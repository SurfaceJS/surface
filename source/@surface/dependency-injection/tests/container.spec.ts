import chai                        from "chai";
import { shouldFail, suite, test } from "../../test-suite";
import { Baz }                     from "./mocks/baz";
import container, { SYMBOL_KEY }   from "./mocks/container";
import InjectableMock              from "./mocks/injectable-mock";

@suite
export default class DependencyInjectionSpec
{
    @test
    public resolveConstructor(): void
    {
        const instance1 = container.resolveConstructor(InjectableMock);
        const instance2 = container.resolve<InjectableMock>("injectable-mock");

        chai.expect(instance1).to.not.equal(instance2);
        chai.expect(instance1.foo).to.equal(instance2.foo);
        chai.expect(instance1.bar).to.equal(instance2.bar);
        chai.expect(instance1.baz).to.equal(instance2.baz);
    }

    @test
    public resolveConstructorWithoutInjections(): void
    {
        const instance1 = container.resolveConstructor(class Mock { });

        chai.expect(instance1).to.not.equal(null);
    }

    @test
    public resolveInstanceWithoutInjections(): void
    {
        const instance = container.resolveInstance(new (class Mock { })());

        chai.expect(instance).to.not.equal(null);
    }

    @test
    public resolveInstance(): void
    {
        const instance1 = container.resolveInstance(new InjectableMock(new Baz()));
        const instance2 = container.resolve<InjectableMock>("injectable-mock");

        chai.expect(instance1).to.not.equal(instance2);
        chai.expect(instance1.foo).to.equal(instance2.foo);
        chai.expect(instance1.bar).to.equal(instance2.bar);
        chai.expect(instance1.baz).to.not.equal(instance2.baz);
    }

    @test
    public resolveFromStringKey(): void
    {
        const instance1 = container.resolve<InjectableMock>("injectable-mock");
        const instance2 = container.resolve<InjectableMock>("injectable-mock");

        chai.expect(instance1).to.equal(instance2);
        chai.expect(instance1.foo).to.equal(instance2.foo);
        chai.expect(instance1.bar).to.equal(instance2.bar);
        chai.expect(instance1.baz).to.equal(instance2.baz);
    }

    @test
    public resolveFromSymbolKey(): void
    {
        const instance1 = container.resolve<InjectableMock>(SYMBOL_KEY);
        const instance2 = container.resolve<InjectableMock>(SYMBOL_KEY);

        chai.expect(instance1).to.equal(instance2);
        chai.expect(instance1.foo).to.equal(instance2.foo);
        chai.expect(instance1.bar).to.equal(instance2.bar);
        chai.expect(instance1.baz).to.equal(instance2.baz);
    }

    @test
    public resolveFromConstructorKey(): void
    {
        const instance1 = container.resolve(InjectableMock);
        const instance2 = container.resolve(InjectableMock);

        chai.expect(instance1).to.equal(instance2);
        chai.expect(instance1.foo).to.equal(instance2.foo);
        chai.expect(instance1.bar).to.equal(instance2.bar);
        chai.expect(instance1.baz).to.equal(instance2.baz);
    }

    @test
    public resolveFactory(): void
    {
        const instance1 = container.resolve<InjectableMock>("factory");
        const instance2 = container.resolve(InjectableMock);

        chai.expect(instance1).to.not.equal(instance2);
        chai.expect(instance1.foo).to.not.equal(instance2.foo);
        chai.expect(instance1.bar).to.not.equal(instance2.bar);
        chai.expect(instance1.baz).to.equal(instance2.baz);
    }

    @test
    public resolveWithNewInstance(): void
    {
        const instance1 = container.resolve(InjectableMock, true);
        const instance2 = container.resolve(InjectableMock, true);

        chai.expect(instance1).to.not.equal(instance2);
        chai.expect(instance1.foo).to.equal(instance2.foo);
        chai.expect(instance1.bar).to.equal(instance2.bar);
        chai.expect(instance1.baz).to.equal(instance2.baz);
    }

    @test
    public resolveWithNewInstanceCascade(): void
    {
        const instance1 = container.resolve(InjectableMock, true, true);
        const instance2 = container.resolve(InjectableMock, true, true);

        chai.expect(instance1).to.not.equal(instance2);
        chai.expect(instance1.foo).to.not.equal(instance2.foo);
        chai.expect(instance1.bar).to.not.equal(instance2.bar);
        chai.expect(instance1.baz).to.not.equal(instance2.baz);
    }

    @test @shouldFail
    public resolveInvalidKey(): void
    {
        chai.expect(() => container.resolve(class Foo { }), "constructor").to.throw("Cannot resolve entry for the key Foo");
        chai.expect(() => container.resolve(Symbol("s")),   "symbol").to.throw("Cannot resolve entry for the key Symbol(s)");
        chai.expect(() => container.resolve("$"),           "string").to.throw("Cannot resolve entry for the key $");
    }
}
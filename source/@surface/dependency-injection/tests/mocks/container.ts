import Container      from "../../internal/container";
import { Bar }        from "./bar";
import { Baz }        from "./baz";
import { Foo }        from "./foo";
import InjectableMock from "./injectable-mock";

export const SYMBOL_KEY = Symbol("symbol-key");

const container = new Container();

container
    .register("bar", Bar)
    .register("baz", Baz)
    .register("foo", Foo)
    .register(InjectableMock)
    .register("factory", (x: Container) => new InjectableMock(x.resolve("baz")))
    .register("injectable-mock", InjectableMock)
    .register(SYMBOL_KEY, InjectableMock);

export default container;
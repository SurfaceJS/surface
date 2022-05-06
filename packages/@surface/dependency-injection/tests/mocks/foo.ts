import inject from "../../internal/decorators/inject.js";
import Bar    from "./bar.js";

export default class Foo
{
    public constructor(@inject("bar") public readonly bar: Bar)
    { }
}
import { inject } from "../../internal/decorators.js";
import type Bar   from "./bar.js";

export default class Foo
{
    public constructor(@inject("bar") public readonly bar: Bar)
    { }
}
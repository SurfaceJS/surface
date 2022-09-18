import inject from "../../internal/decorators/inject.js";
import Baz    from "./baz.js";

export default class Bar
{
    public constructor(@inject("baz") public readonly baz: Baz)
    { }
}
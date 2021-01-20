import inject   from "../../internal/decorators/inject.js";
import type Qux from "./qux.js";

export default class Baz
{
    public constructor(@inject("qux") public qux: Qux)
    { }
}
import { inject } from "../../internal/decorators.js";
import type Bar   from "./bar.js";
import type Baz   from "./baz.js";
import type Foo   from "./foo.js";

export default class InjectableMock
{
    private _bar!: Bar;
    private readonly _baz!: Baz;

    @inject("foo")
    public foo!: Foo;

    @inject("bar")
    public get bar(): Bar
    {
        return this._bar;
    }

    public set bar(value: Bar)
    {
        this._bar = value;
    }

    public get baz(): Baz
    {
        return this._baz;
    }

    public constructor(@inject("baz") baz: Baz)
    {
        this._baz = baz;
    }
}
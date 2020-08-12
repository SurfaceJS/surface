import { inject } from "../..";
import Bar        from "./bar";
import Baz        from "./baz";
import Foo        from "./foo";

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
import inject from "../../internal/decorators/inject.js";
import Bar    from "./bar.js";
import Baz    from "./baz.js";
import Foo    from "./foo.js";
import Qux    from "./qux.js";

export default class InjectableMock
{
    private readonly _bar!: Bar;
    private _baz!: Baz;

    @inject("qux")
    public qux!: Qux;

    public get bar(): Bar
    {
        return this._bar;
    }

    @inject("baz")
    public get baz(): Baz
    {
        return this._baz;
    }

    public set baz(value: Baz)
    {
        this._baz = value;
    }

    public constructor(@inject("foo") public foo: Foo, @inject("bar") bar: Bar)
    {
        this._bar = bar;
    }
}
import CustomElement          from "../..";
import { attribute, element } from "../../decorators";

@element("fixture-element", "<span>this value is: {{ host.value }}</span>")
export default class FixtureEleNoAttributeChangedment extends CustomElement
{
    private _anotherValue: number = 0;
    public get anotherValue(): number
    {
        return this._anotherValue;
    }

    public set anotherValue(value: number)
    {
        this._anotherValue = value;
    }

    private _value: number = 0;

    @attribute
    public get value(): number
    {
        return this._value;
    }

    public set value(value: number)
    {
        this._value = value;
    }

    public constructor()
    {
        super();
    }
}
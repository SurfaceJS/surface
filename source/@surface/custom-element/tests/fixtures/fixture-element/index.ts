import CustomElement          from "../../..";
import { attribute, element } from "../../../decorators";

@element("fixture-element", "<span>this value is: {{ host.value }}</span>")
export default class FixtureElement extends CustomElement
{
    private _value: number = 0;

    @attribute
    public get value(): number
    {
        return this._value;
    }

    public set value(value: number)
    {
        const old = this._value;
        this._value = value;
        this.attributeChangedCallback("value", old.toString(), value.toString(), "");
    }

    public constructor()
    {
        super();
    }
}
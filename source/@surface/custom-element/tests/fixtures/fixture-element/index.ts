import CustomElement from "../../..";
import { element }   from "../../../decorators";

@element("fixture-element", "<span>this value is: {{ host.value }}</span>")
export default class FixtureElement extends CustomElement
{
    private _value: number = 1;
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
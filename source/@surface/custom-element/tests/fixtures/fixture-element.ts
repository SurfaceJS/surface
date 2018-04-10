import CustomElement          from "../..";
import { attribute, element } from "../../decorators";

@element("fixture-element", "<span>this value is: {{ host.value }}</span>")
export default class FixtureElement extends CustomElement
{
    private _anotherValue: number = 0;
    public get anotherValue(): number
    {
        return this._anotherValue;
    }

    public set anotherValue(value: number)
    {
        const old = this._value;
        this._anotherValue = value;
        this.attributeChangedCallback("anotherValue", old.toString(), value.toString(), "");
    }

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

    /**
     * Called when an attribute is changed, appended, removed, or replaced on the element.
     * Only called for observed attributes.
     */
    protected attributeChangedCallback(attributeName: string, oldValue: string, newValue: string, namespace: string): void
    {
        return;
    }
}
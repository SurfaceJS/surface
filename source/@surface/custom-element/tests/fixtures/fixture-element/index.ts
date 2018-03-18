import index from "./index.html";

import { element }   from "../../../decorators";
import CustomElement from "../../..";

@element("fixture-element", index)
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
import CustomElement from "@surface/custom-element";

export default abstract class View extends CustomElement
{
    private _name: string = "";
    public get name(): string
    {
        return this._name;
    }

    public set name(value: string)
    {
        this._name = value;
    }
}
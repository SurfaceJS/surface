import CustomElement from "@surface/custom-element";

export default abstract class View extends CustomElement
{
    private _viewName: string = "";
    public get viewName(): string
    {
        return this._viewName;
    }

    public set viewName(value: string)
    {
        this._viewName = value;
    }
}
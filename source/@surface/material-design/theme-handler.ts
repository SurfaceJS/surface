import ColorBucket from "./color-bucket";

export default class ThemeHandler
{
    private _dark: boolean = false;
    private _light: boolean = false;

    public get dark(): boolean
    {
        return this._dark;
    }

    public set dark(value: boolean)
    {
        this._dark = value;

        if (value)
        {
            ColorBucket.useDark();
        }
        else
        {
            ColorBucket.useDefault();
        }
    }

    public get light(): boolean
    {
        return this._light;
    }

    public set light(value: boolean)
    {
        this._light = value;

        if (value)
        {
            ColorBucket.useLight();
        }
        else
        {
            ColorBucket.useDefault();
        }
    }

    public toogle(): void
    {
        if (this.dark)
        {
            this.dark  = false;
            this.light = true;
        }
        else if (this.light)
        {
            this.light = false;
            this.dark  = true;
        }
        else
        {
            this.dark = true;
        }
    }
}
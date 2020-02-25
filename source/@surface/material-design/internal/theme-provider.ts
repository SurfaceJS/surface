import { merge }                               from "@surface/core/common/object";
import IRawPalette                             from "../interfaces/raw-palette";
import IRawTheme                               from "../interfaces/raw-theme";
import ITheme                                  from "../interfaces/theme";
import { generateCssVariables, generateTheme } from "../internal/common";
import defaultTheme                            from "./default-theme";
import materialColors                          from "./material-colors";

export default class ThemeProvider
{
    private readonly style: HTMLStyleElement;

    private readonly materialColorsVariables: Array<string>;

    private darkThemeVariables:  Array<string> = [];
    private lightThemeVariables: Array<string> = [];
    private themeVariables:      Array<string> = [];

    private _dark:  boolean = false;

    public theme: ITheme;

    public get dark(): boolean
    {
        return this._dark;
    }

    public set dark(value: boolean)
    {
        this._dark = value;

        this.updateStyle();

        value ? document.body.classList.add("dark") : document.body.classList.remove("dark");
    }

    public constructor()
    {
        this.materialColorsVariables = generateCssVariables(materialColors);
        this.style                   = this.createStyle();
        this.theme                   = generateTheme(defaultTheme) as ITheme;

        this.updateVariables();
    }

    private createStyle(): HTMLStyleElement
    {
        const style = document.createElement("style");

        style.id = "smd-css-variables";

        document.head.appendChild(style);

        return style;
    }

    private updateVariables(): void
    {
        this.darkThemeVariables  = generateCssVariables(this.theme.dark);
        this.lightThemeVariables = generateCssVariables(this.theme.light);
        this.themeVariables      = generateCssVariables(this.theme);

        this.updateStyle();
    }

    private updateStyle(): void
    {
        if (this.style)
        {
            this.style.innerHTML =
            [
                "*",
                "{",
                ...this.materialColorsVariables,
                ...(this.dark ? this.darkThemeVariables : this.lightThemeVariables),
                ...this.themeVariables,
                "}"
            ].join("\n");
        }
    }

    public use(theme: IRawPalette|IRawTheme): void
    {
        const generated = generateTheme("dark" in theme || "light" in theme ? theme : { light: theme as IRawPalette });

        this.theme = merge([this.theme, generated]) as ITheme;

        this.updateVariables();
    }
}
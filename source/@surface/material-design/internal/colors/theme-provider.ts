import { merge }                               from "@surface/core";
import { generateCssVariables, generateTheme } from "../common.js";
import type RawPalette                         from "../types/raw-palette";
import type RawTheme                           from "../types/raw-theme";
import type Theme                              from "../types/theme";
import defaultTheme                            from "./default-theme.js";
import materialColors                          from "./material-colors.js";

export default class ThemeProvider
{
    private readonly style: HTMLStyleElement;

    private readonly materialColorsVariables: string[];

    private darkThemeVariables:  string[] = [];
    private lightThemeVariables: string[] = [];
    private themeVariables:      string[] = [];

    private _dark:  boolean = false;

    public theme: Theme;

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
        this.theme                   = generateTheme(defaultTheme) as Theme;

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
                ...this.dark ? this.darkThemeVariables : this.lightThemeVariables,
                ...this.themeVariables,
                "}",
            ].join("\n");
        }
    }

    public use(theme: RawPalette|RawTheme): void
    {
        const generated = generateTheme("dark" in theme || "light" in theme ? theme : { light: theme as RawPalette });

        this.theme = merge(this.theme, generated) as Theme;

        this.updateVariables();
    }
}
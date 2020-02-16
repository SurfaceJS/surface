import { DeepPartial }                          from "@surface/core";
import { typeGuard }                            from "@surface/core/common/generic";
import { getValue, merge }                      from "@surface/core/common/object";
import { dashedToCamel }                        from "@surface/core/common/string";
import { Color }                                from "../interfaces/color";
import ITheme                                   from "../interfaces/theme";
import IThemes                                  from "../interfaces/themes";
import { generateCssVariables, generateThemes } from "../internal/common";
import defaultTheme                             from "./default-theme";
import materialColors                           from "./material-colors";

export default class ThemeProvider
{
    private readonly style: HTMLStyleElement;

    private readonly materialColorsVariables: Array<string>;

    private darkThemeVariables:  Array<string> = [];
    private lightThemeVariables: Array<string> = [];
    private themesVariables:     Array<string> = [];

    private _dark:  boolean = false;

    public themes: IThemes;

    public get dark(): boolean
    {
        return this._dark;
    }

    public set dark(value: boolean)
    {
        this._dark = value;

        this.updateStyle();
    }

    public constructor()
    {
        this.materialColorsVariables = generateCssVariables(materialColors);
        this.style                   = this.createStyle();
        this.themes                  = generateThemes(defaultTheme);

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
        this.darkThemeVariables  = generateCssVariables(this.themes.dark);
        this.lightThemeVariables = generateCssVariables(this.themes.light);
        this.themesVariables     = generateCssVariables(this.themes);

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
                ...this.themesVariables,
                "}"
            ].join("\n");
        }
    }

    public getColor(name: string): string
    {
        const path = name.split(":").map(dashedToCamel);

        const color = getValue(materialColors, path)
            ?? getValue(this.themes, path)
            ?? getValue(this.dark ? this.themes.dark : this.themes.light, path)
            ?? "#000000";

        return typeGuard<Color>(color, color instanceof Object) ? color["500"] : color as string;
    }

    public use(themes: DeepPartial<ITheme>|DeepPartial<IThemes>): void
    {
        const generated = generateThemes("dark" in themes || "light" in themes ? themes : { light: themes as ITheme });

        this.themes = merge([this.themes, generated]);

        this.updateVariables();
    }
}
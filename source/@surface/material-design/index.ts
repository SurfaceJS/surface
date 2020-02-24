import { DeepPartial } from "@surface/core";
import ITheme          from "./interfaces/theme";
import IThemes         from "./interfaces/themes";
import materialColors  from "./internal/material-colors";
import ThemeProvider   from "./internal/theme-provider";

export default class MaterialDesign
{
    private static readonly themeProvider = new ThemeProvider();

    public static readonly colors = materialColors;

    public static useDark(): typeof MaterialDesign
    {
        this.themeProvider.dark = true;

        return this;
    }

    public static useLight(): typeof MaterialDesign
    {
        this.themeProvider.dark = false;

        return this;
    }

    public static useTheme(themes: DeepPartial<ITheme>|DeepPartial<IThemes>): typeof MaterialDesign
    {
        this.themeProvider.use(themes);

        return this;
    }
}
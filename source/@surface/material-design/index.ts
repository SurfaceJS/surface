import materialColors  from "./internal/material-colors.js";
import ThemeProvider   from "./internal/theme-provider.js";
import type RawPalette from "./types/raw-palette";
import type RawTheme   from "./types/raw-theme";

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

    public static useTheme(theme: RawPalette|RawTheme): typeof MaterialDesign
    {
        this.themeProvider.use(theme);

        return this;
    }
}
import IRawPalette    from "./interfaces/raw-palette";
import IRawTheme      from "./interfaces/raw-theme";
import materialColors from "./internal/material-colors";
import ThemeProvider  from "./internal/theme-provider";

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

    public static useTheme(theme: IRawPalette|IRawTheme): typeof MaterialDesign
    {
        this.themeProvider.use(theme);

        return this;
    }
}
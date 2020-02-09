import { DeepPartial } from "@surface/core";
import IThemes         from "../interfaces/themes";
import materialColors  from "../material-colors";

const defaultTheme: DeepPartial<Omit<IThemes, "default">> =
{
    dark:
    {
        accent:     materialColors.blue["A200"],
        background: materialColors.grey["800"],
        error:      materialColors.red,
        info:       materialColors.blue,
        primary:    materialColors.indigo,
        secondary:  materialColors.blue,
        success:    materialColors.green,
        text:       materialColors.white,
        warning:    materialColors.amber,
    },
    light:
    {
        accent:     materialColors.pink["A200"],
        background: materialColors.white,
        error:      "#ff0005",//materialColors.red["A200"],
        info:       materialColors.blue,
        primary:    materialColors.blue,
        secondary:  materialColors.indigo,
        success:    materialColors.green,
        text:       materialColors.white,
        warning:    materialColors.amber,
    }
};

export default defaultTheme;
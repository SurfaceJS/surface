import IRawTheme      from "../interfaces/raw-theme";
import materialColors from "./material-colors";

const defaultTheme: IRawTheme =
{
    dark:
    {
        accent:     materialColors.blue["A200"],
        background: { "400": "#363636",  "500": "#1f1f1f" } ,
        error:      materialColors.red,
        info:       materialColors.blue,
        primary:    materialColors.indigo,
        secondary:  materialColors.blue,
        success:    materialColors.green,
        text:       "#ffffffb3",
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
        text:       "#00000099",
        warning:    materialColors.amber,
    }
};

export default defaultTheme;
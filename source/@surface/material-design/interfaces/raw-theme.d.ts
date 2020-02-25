import IRawPalette from "./raw-palette";
import ITheme      from "./theme";

export default interface IRawTheme extends Partial<Record<keyof ITheme, IRawPalette>>
{ }
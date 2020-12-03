import RawPalette from "./raw-palette";
import Theme      from "./theme";

type RawTheme = Partial<Record<keyof Theme, RawPalette>>;

export default RawTheme;
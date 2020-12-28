import type RawPalette from "./raw-palette";
import type Theme      from "./theme";

type RawTheme = Partial<Record<keyof Theme, RawPalette>>;

export default RawTheme;
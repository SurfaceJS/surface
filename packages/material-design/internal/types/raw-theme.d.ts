import type RawPalette from "./raw-palette.js";
import type Theme      from "./theme.js";

type RawTheme = Partial<Record<keyof Theme, RawPalette>>;

export default RawTheme;
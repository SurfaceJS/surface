import type Palette from "./palette.js";
import type Shades  from "./shades.js";

type RawPalette = Partial<Record<keyof Palette, string|Partial<Shades>>>;

export default RawPalette;
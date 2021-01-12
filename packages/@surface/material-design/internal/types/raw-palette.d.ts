import type Palette from "./palette";
import type Shades  from "./shades";

type RawPalette = Partial<Record<keyof Palette, string|Partial<Shades>>>;

export default RawPalette;
import Palette from "./palette";
import Shades  from "./shades";

type RawPalette = Partial<Record<keyof Palette, string|Partial<Shades>>>;

export default RawPalette;
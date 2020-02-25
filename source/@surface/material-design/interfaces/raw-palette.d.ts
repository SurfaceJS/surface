import IPalette  from "./palette";
import IShades   from "./shades";

export default interface IRawPalette extends Partial<Record<keyof IPalette, string|Partial<IShades>>>
{ }
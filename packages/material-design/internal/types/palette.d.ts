import type Shades from "./shades";

type Palette =
{
    [name: string]: Shades | undefined,

    accent:     Shades,
    background: Shades,
    error:      Shades,
    info:       Shades,
    primary:    Shades,
    secondary:  Shades,
    success:    Shades,
    surface:    Shades,
    text:       Shades,
    warning:    Shades,
};

export default Palette;
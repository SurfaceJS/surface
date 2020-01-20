import { Color } from "./color";
export type Theme =
{
    [name: string]: string|Partial<Color>|Partial<Theme>;

    accent:     string|Partial<Color>;
    background: string|Partial<Color>;
    error:      string|Partial<Color>;
    info:       string|Partial<Color>;
    primary:    string|Partial<Color>;
    secondary:  string|Partial<Color>;
    success:    string|Partial<Color>;
    text:       string|Partial<Color>;
    warning:    string|Partial<Color>;

    dark:  Partial<Theme>;
    light: Partial<Theme>;
};

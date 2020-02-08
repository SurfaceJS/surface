import { Color } from "./color";

export default interface ITheme
{
    [name: string]: string|Color;

    accent:     string|Color;
    background: string|Color;
    error:      string|Color;
    info:       string|Color;
    primary:    string|Color;
    secondary:  string|Color;
    success:    string|Color;
    text:       string|Color;
    warning:    string|Color;
}
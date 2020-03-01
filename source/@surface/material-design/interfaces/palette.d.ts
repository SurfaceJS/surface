import IShades from "./shades";

export default interface IPalette
{
    [name: string]: IShades|undefined;

    accent:     IShades;
    background: IShades;
    error:      IShades;
    info:       IShades;
    primary:    IShades;
    secondary:  IShades;
    success:    IShades;
    surface:    IShades;
    text:       IShades;
    warning:    IShades;
}
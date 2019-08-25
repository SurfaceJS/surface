import { Constructor } from "../../../core";

export default interface IInjections
{
    parameters: Array<string|symbol|Constructor>;
    properties: Array<[string|symbol, string|symbol|Constructor]>;
}
import type { PATTERN } from "../symbols.js";
import type INode       from "./node.js";

export default interface IPattern extends INode
{
    [PATTERN]: void;
    evaluate(scope: object, value: unknown): object;
    clone(): IPattern;
}
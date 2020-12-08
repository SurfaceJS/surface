import { PATTERN } from "../symbols.js";
import type INode  from "./node.js";

export default interface IPattern extends INode
{
    [PATTERN]: void;
    clone(): IPattern;
}
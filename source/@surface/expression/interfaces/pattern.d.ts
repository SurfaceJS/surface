import NodeType    from "../node-type";
import { PATTERN } from "../symbols";
import INode       from "./node";

export default interface IPattern extends INode
{
    [PATTERN]: void;
    clone(): IPattern;
}
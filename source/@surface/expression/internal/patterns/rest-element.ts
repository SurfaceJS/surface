import IPattern    from "../../interfaces/pattern";
import NodeType    from "../../node-type";
import { PATTERN } from "../../symbols";

export default class RestElement implements IPattern
{
    private readonly _argument: IPattern;

    public [PATTERN]: void;

    public get argument(): IPattern
    {
        return this._argument;
    }

    public get type(): NodeType
    {
        return NodeType.RestElement;
    }

    public constructor(argument: IPattern)
    {
        this._argument = argument;
    }

    public toString(): string
    {
        return `...${this.argument}`;
    }
}
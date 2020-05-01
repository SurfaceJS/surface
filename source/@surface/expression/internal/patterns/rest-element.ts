import IPattern     from "../../interfaces/pattern";
import IRestElement from "../../interfaces/rest-element";
import NodeType     from "../../node-type";
import { PATTERN }  from "../../symbols";

export default class RestElement implements IPattern
{
    private _argument: IPattern;

    public [PATTERN]: void;

    public get argument(): IPattern
    {
        return this._argument;
    }

    /* istanbul ignore next */
    public set argument(value: IPattern)
    {
        this._argument = value;
    }

    public get type(): NodeType
    {
        return NodeType.RestElement;
    }

    public constructor(argument: IPattern)
    {
        this._argument = argument;
    }

    public clone(): IRestElement
    {
        return new RestElement(this.argument.clone());
    }

    public toString(): string
    {
        return `...${this.argument}`;
    }
}
import IAssignmentProperty from "../../interfaces/assignment-property";
import IPattern            from "../../interfaces/pattern";
import IRestElement        from "../../interfaces/rest-element";
import NodeType            from "../../node-type";
import { PATTERN }         from "../../symbols";

export default class ObjectPattern implements IPattern
{
    private _properties: Array<IAssignmentProperty|IRestElement>;

    public [PATTERN]: void;

    public get properties(): Array<IAssignmentProperty|IRestElement>
    {
        return this._properties;
    }

    public get type(): NodeType
    {
        return NodeType.ObjectPattern;
    }

    public constructor(properties: Array<IAssignmentProperty|IRestElement>)
    {
        this._properties = properties;
    }

    public toString(): string
    {
        return `{ ${this.properties.map(x => x.toString()).join(", ")} }`;
    }
}
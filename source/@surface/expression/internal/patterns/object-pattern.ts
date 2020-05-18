import IAssignmentProperty from "../interfaces/assignment-property";
import IObjectPattern      from "../interfaces/object-pattern";
import IPattern            from "../interfaces/pattern";
import IRestElement        from "../interfaces/rest-element";
import NodeType            from "../node-type";
import { PATTERN }         from "../symbols";

export default class ObjectPattern implements IPattern
{
    private _properties: Array<IAssignmentProperty|IRestElement>;

    public [PATTERN]: void;

    public get properties(): Array<IAssignmentProperty|IRestElement>
    {
        return this._properties;
    }

    /* istanbul ignore next */
    public set properties(value: Array<IAssignmentProperty|IRestElement>)
    {
        this._properties = value;
    }

    public get type(): NodeType
    {
        return NodeType.ObjectPattern;
    }

    public constructor(properties: Array<IAssignmentProperty|IRestElement>)
    {
        this._properties = properties;
    }

    public clone(): IObjectPattern
    {
        return new ObjectPattern(this.properties.map(x => x.clone()));
    }

    public toString(): string
    {
        return `{ ${this.properties.map(x => x.toString()).join(", ")} }`;
    }
}
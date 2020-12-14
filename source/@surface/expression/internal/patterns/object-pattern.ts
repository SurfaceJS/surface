import type IAssignmentProperty from "../interfaces/assignment-property";
import type IObjectPattern      from "../interfaces/object-pattern";
import type IPattern            from "../interfaces/pattern";
import type IRestElement        from "../interfaces/rest-element";
import NodeType                 from "../node-type.js";
import { PATTERN }              from "../symbols.js";

export default class ObjectPattern implements IPattern
{
    private _properties: (IAssignmentProperty | IRestElement)[];

    public [PATTERN]: void;

    public get properties(): (IAssignmentProperty | IRestElement)[]
    {
        return this._properties;
    }

    /* c8 ignore next 4 */
    public set properties(value: (IAssignmentProperty | IRestElement)[])
    {
        this._properties = value;
    }

    public get type(): NodeType
    {
        return NodeType.ObjectPattern;
    }

    public constructor(properties: (IAssignmentProperty | IRestElement)[])
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
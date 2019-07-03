import IPattern        from "../../interfaces/pattern";
import IProperty       from "../../interfaces/property";
import IRestElement from "../../interfaces/rest-element";
import NodeType        from "../../node-type";

export default class ObjectPattern implements IPattern
{
    private _properties: Array<IProperty|IRestElement>;
    public get properties(): Array<IProperty|IRestElement>
    {
        return this._properties;
    }

    public get type(): NodeType
    {
        return NodeType.ArrayPattern;
    }

    public constructor(properties: Array<IProperty|IRestElement>)
    {
        this._properties = properties;
    }

    public toString(): string
    {
        return `{ ${this.properties.map(x => x.toString()).join(", ")} }`;
    }
}
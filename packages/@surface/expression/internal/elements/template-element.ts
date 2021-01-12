import type INode            from "../interfaces/node";
import type ITemplateElement from "../interfaces/template-element";
import NodeType              from "../node-type.js";

export default class TemplateElement implements INode
{
    private _cooked: string;
    public get cooked(): string
    {
        return this._cooked;
    }

    /* c8 ignore next 4 */
    public set cooked(value: string)
    {
        this._cooked = value;
    }

    private _raw: string;
    public get raw(): string
    {
        return this._raw;
    }

    /* c8 ignore next 4 */
    public set raw(value: string)
    {
        this._raw = value;
    }

    private _tail: boolean;

    /* c8 ignore next 4 */
    public get tail(): boolean
    {
        return this._tail;
    }

    /* c8 ignore next 4 */
    public set tail(value: boolean)
    {
        this._tail = value;
    }

    public get type(): NodeType
    {
        return NodeType.TemplateElement;
    }

    public constructor(cooked: string, raw: string, tail: boolean)
    {
        this._cooked = cooked;
        this._raw    = raw;
        this._tail   = tail;
    }

    public clone(): ITemplateElement
    {
        return new TemplateElement(this.cooked, this.raw, this.tail);
    }
}
import type IExpression    from "../interfaces/expression";
import type INode          from "../interfaces/node";
import type ISpreadElement from "../interfaces/spread-element";
import NodeType            from "../node-type.js";

export default class SpreadElement implements INode
{
    private _argument: IExpression;
    public get argument(): IExpression
    {
        return this._argument;
    }

    /* istanbul ignore next */
    public set argument(value: IExpression)
    {
        this._argument = value;
    }

    public get type(): NodeType
    {
        return NodeType.SpreadElement;
    }

    public constructor(argument: IExpression)
    {
        this._argument = argument;
    }

    public clone(): ISpreadElement
    {
        return new SpreadElement(this.argument.clone());
    }

    public toString(): string
    {
        return `...${this.argument}`;
    }
}
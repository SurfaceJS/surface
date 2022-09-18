import type IExpression    from "../interfaces/expression.js";
import type INode          from "../interfaces/node.js";
import NodeType            from "../node-type.js";

export default class SpreadElement implements INode
{
    private _argument: IExpression;
    public get argument(): IExpression
    {
        return this._argument;
    }

    /* c8 ignore next 4 */
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

    public clone(): SpreadElement
    {
        return new SpreadElement(this.argument.clone());
    }

    public toString(): string
    {
        return `...${this.argument}`;
    }
}
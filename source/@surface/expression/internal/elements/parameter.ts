import INode                     from "../../interfaces/node";
import NodeType                  from "../../node-type";
import { PatternElement } from "../../types";

export default class Parameter implements INode
{
    private _expression: PatternElement;
    public get expression(): PatternElement
    {
        return this._expression;
    }

    public get type(): NodeType
    {
        return NodeType.Parameter;
    }

    public constructor(expression: PatternElement)
    {
        this._expression = expression;
    }

    public toString(): string
    {
        return this.expression.toString();
    }
}
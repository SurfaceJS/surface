import IExpression    from "../../interfaces/expression";
import ISpreadElement from "../../interfaces/spread-element";
import NodeType       from "../../node-type";
import TypeGuard      from "../type-guard";
import BaseExpression from "./abstracts/base-expression";

export default class ArrayExpression extends BaseExpression<Array<unknown>>
{
    private readonly _elements: Array<IExpression|ISpreadElement>;

    public get elements(): Array<IExpression|ISpreadElement>
    {
        return this._elements;
    }

    public get type(): NodeType
    {
        return NodeType.Array;
    }

    public constructor(elements: Array<IExpression|ISpreadElement>)
    {
        super();
        this._elements = elements;
    }

    public evaluate(): Array<unknown>
    {
        const evaluation: Array<unknown> = [];

        for (const element of this.elements)
        {
            if (TypeGuard.isSpreadElement(element))
            {
                evaluation.push(...element.argument.evaluate() as Array<unknown>);
            }
            else
            {
                evaluation.push(element.evaluate());
            }
        }

        return this._cache = evaluation;
    }

    public toString(): string
    {
        return `[${this.elements.map(x => x.toString()).join(", ")}]`;
    }
}
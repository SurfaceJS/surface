import IExpression    from "../../interfaces/expression";
import ISpreadElement from "../../interfaces/spread-element";
import NodeType       from "../../node-type";
import TypeGuard      from "../type-guard";
import BaseExpression from "./abstracts/base-expression";

export default class ArrayExpression extends BaseExpression<Array<unknown>>
{
    private _elements: Array<IExpression|ISpreadElement|null>;

    public get elements(): Array<IExpression|ISpreadElement|null>
    {
        return this._elements;
    }

    public set elements(value: Array<IExpression|ISpreadElement|null>)
    {
        this._elements = value;
    }

    public get type(): NodeType
    {
        return NodeType.ArrayExpression;
    }

    public constructor(elements: Array<IExpression|ISpreadElement|null>)
    {
        super();
        this._elements = elements;
    }

    public evaluate(): Array<unknown>
    {
        const evaluation: Array<unknown> = [];

        for (const element of this.elements)
        {
            if (element)
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
            else
            {
                evaluation.push(undefined);
            }
        }

        return this._cache = evaluation;
    }

    public toString(): string
    {
        return `[${this.elements.map(x => (x || "undefined").toString()).join(", ")}]`;
    }
}
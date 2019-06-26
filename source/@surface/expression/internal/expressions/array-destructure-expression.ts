import ExpressionType         from "../../expression-type";
import { DestructureElement } from "../../types";
import BaseExpression         from "./abstracts/base-expression";

export default class ArrayDestructureExpression extends BaseExpression
{
    private _elements: Array<DestructureElement>;
    public get elements(): Array<DestructureElement>
    {
        return this._elements;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.ArrayDestructure;
    }

    public constructor(elements: Array<DestructureElement>)
    {
        super();

        this._elements = elements;
    }

    public evaluate(): unknown
    {
        return this._cache = undefined;
    }

    public toString(): string
    {
        return `[${this.elements.map(x => x.toString()).join(", ")}]`;
    }
}
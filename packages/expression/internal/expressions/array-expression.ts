import type SpreadElement from "../elements/spread-element.js";
import type IExpression   from "../interfaces/expression.js";
import NodeType           from "../node-type.js";
import TypeGuard          from "../type-guard.js";

export default class ArrayExpression implements IExpression
{
    private _elements: (IExpression | SpreadElement | null)[];
    public get elements(): (IExpression | SpreadElement | null)[]
    {
        return this._elements;
    }

    /* c8 ignore next 4 */
    public set elements(value: (IExpression | SpreadElement | null)[])
    {
        this._elements = value;
    }

    public get type(): NodeType
    {
        return NodeType.ArrayExpression;
    }

    public constructor(elements: (IExpression | SpreadElement | null)[])
    {
        this._elements = elements;
    }

    public clone(): ArrayExpression
    {
        return new ArrayExpression(this.elements.map(x => x?.clone() ?? null));
    }

    public evaluate(scope: object): unknown[]
    {
        const evaluation: unknown[] = [];

        for (const element of this.elements)
        {
            if (element)
            {
                if (TypeGuard.isSpreadElement(element))
                {
                    evaluation.push(...element.argument.evaluate(scope) as unknown[]);
                }
                else
                {
                    evaluation.push(element.evaluate(scope));
                }
            }
            else
            {
                evaluation.push(undefined);
            }
        }

        return evaluation;
    }

    public toString(): string
    {
        return `[${this.elements.map(x => (x ?? "undefined").toString()).join(", ")}]`;
    }
}
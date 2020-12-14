import { hasValue }          from "@surface/core";
import type IArrayExpression from "../interfaces/array-expression";
import type IExpression      from "../interfaces/expression";
import type ISpreadElement   from "../interfaces/spread-element";
import NodeType              from "../node-type.js";
import TypeGuard             from "../type-guard.js";

export default class ArrayExpression implements IExpression
{
    private cache: unknown[] | null = null;

    private _elements: (IExpression | ISpreadElement | null)[];
    public get elements(): (IExpression | ISpreadElement | null)[]
    {
        return this._elements;
    }

    /* c8 ignore next 4 */
    public set elements(value: (IExpression | ISpreadElement | null)[])
    {
        this._elements = value;
    }

    public get type(): NodeType
    {
        return NodeType.ArrayExpression;
    }

    public constructor(elements: (IExpression | ISpreadElement | null)[])
    {
        this._elements = elements;
    }

    public clone(): IArrayExpression
    {
        return new ArrayExpression(this.elements.map(x => x?.clone() ?? null));
    }

    public evaluate(scope: object, useCache?: boolean): unknown[]
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        const evaluation: unknown[] = [];

        for (const element of this.elements)
        {
            if (element)
            {
                if (TypeGuard.isSpreadElement(element))
                {
                    evaluation.push(...element.argument.evaluate(scope, useCache) as unknown[]);
                }
                else
                {
                    evaluation.push(element.evaluate(scope, useCache));
                }
            }
            else
            {
                evaluation.push(undefined);
            }
        }

        return this.cache = evaluation;
    }

    public toString(): string
    {
        return `[${this.elements.map(x => (x ?? "undefined").toString()).join(", ")}]`;
    }
}
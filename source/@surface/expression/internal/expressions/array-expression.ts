import { Indexer, Nullable } from "@surface/core";
import { hasValue }          from "@surface/core/common/generic";
import IExpression           from "../../interfaces/expression";
import ISpreadElement        from "../../interfaces/spread-element";
import NodeType              from "../../node-type";
import TypeGuard             from "../type-guard";

export default class ArrayExpression implements IExpression
{
    private cache: Nullable<Array<unknown>>;

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
        this._elements = elements;
    }

    public evaluate(scope: Indexer, useCache: boolean): Array<unknown>
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        const evaluation: Array<unknown> = [];

        for (const element of this.elements)
        {
            if (element)
            {
                if (TypeGuard.isSpreadElement(element))
                {
                    evaluation.push(...element.argument.evaluate(scope, useCache) as Array<unknown>);
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
        return `[${this.elements.map(x => (x || "undefined").toString()).join(", ")}]`;
    }
}
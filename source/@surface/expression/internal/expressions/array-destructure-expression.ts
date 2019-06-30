import { Indexer }               from "@surface/core";
import { coalesce, typeGuard }   from "@surface/core/common/generic";
import ExpressionType            from "../../expression-type";
import IDestructureExpression    from "../../interfaces/destructure-expression";
import { DestructureExpression } from "../../types";
import Messages                  from "../messages";
import TypeGuard                 from "../type-guard";
import BaseExpression            from "./abstracts/base-expression";

export default class ArrayDestructureExpression extends BaseExpression implements IDestructureExpression
{
    private _elements: Array<DestructureExpression>;
    public get elements(): Array<DestructureExpression>
    {
        return this._elements;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.ArrayDestructure;
    }

    public constructor(elements: Array<DestructureExpression>)
    {
        super();

        this._elements = elements;
    }

    public destruct(value: unknown): Indexer
    {
        const result: Indexer = { };

        if (!typeGuard<Array<unknown>>(value, Array.isArray))
        {
            return result;
        }

        let index = 0;

        for (const element of this.elements)
        {
            if (TypeGuard.isIdentifierExpression(element))
            {
                result[element.name] = value[index];
            }
            else if (TypeGuard.isAssignmentExpression(element))
            {
                if (TypeGuard.isIdentifierExpression(element.left))
                {
                    result[element.left.name] = coalesce(value[index], element.right.evaluate());
                }
                else
                {
                    throw new Error(Messages.illegalPropertyInDeclarationContext);
                }
            }
            else if (TypeGuard.isRestExpression(element))
            {
                Object.assign(result, element.destruct(value.slice(index)));
            }
            else
            {
                Object.assign(result, element.destruct(value[index]));
            }

            index++;
        }

        return result;
    }

    public evaluate(): unknown
    {
        return undefined;
    }

    public toString(): string
    {
        return `[${this.elements.map(x => x.toString()).join(", ")}]`;
    }
}
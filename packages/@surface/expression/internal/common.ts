/* eslint-disable import/prefer-default-export */
import type { Indexer }     from "@surface/core";
import type { IExpression } from "../index.js";
import TypeGuard            from "./type-guard.js";

export function getThisArg(expression: IExpression, scope: object): [thisArg: object | undefined, function: Function | undefined]
{
    if (TypeGuard.isMemberExpression(expression))
    {
        const key = TypeGuard.isIdentifier(expression.property) && !expression.computed ?  expression.property.name : `${expression.property.evaluate(scope)}`;

        const thisArg = expression.object.evaluate(scope) as Indexer;

        return [thisArg, thisArg[key] as Function | undefined];
    }

    return [undefined, expression.evaluate(scope) as Function | undefined];
}
import Expression  from "@surface/expression";
import IExpression from "@surface/expression/interfaces/expression";

const cache: Record<string, IExpression> = { };

export default function parse(expression: string): IExpression
{
    if (expression in cache)
    {
        return cache[expression];
    }

    return cache[expression] = Expression.parse(expression);
}
import Expression  from "@surface/expression";
import IExpression from "@surface/expression/interfaces/expression";

const expressionCache: Record<string, IExpression> = { };

export default function parse(expression: string): IExpression
{
    return expressionCache[expression] = expressionCache[expression] ?? Expression.parse(expression);
}
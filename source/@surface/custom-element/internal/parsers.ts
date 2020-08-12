import { assert } from "@surface/core";
import Expression,
{
    IArrayExpression,
    IArrowFunctionExpression,
    IExpression,
    IIdentifier,
    INode,
    IPattern,
    SyntaxError,
    TypeGuard,
} from "@surface/expression";
import InterpolatedExpression from "./interpolated-expression";
import { forExpression }      from "./patterns";

const cache: Record<string, INode> = { };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseStatement<TParser extends (expression: string) => any>(parser: TParser, statement: string, expression: string): ReturnType<TParser>
{
    try
    {
        return parser(expression);
    }
    catch (error)
    {
        if (error instanceof SyntaxError)
        {
            throw getOffsetSyntaxError(statement, expression, error);
        }

        throw error;
    }
}

export function getOffsetSyntaxError(statement: string, expression: string, error: SyntaxError): SyntaxError
{
    const offset         = statement.indexOf(expression);
    const previous       = statement.substring(0, offset);
    const previousLines  = previous.match(/\n/g)?.length ?? 0;
    const previousColumn = expression.includes("\n") ? 0 : previous.substring(Math.max(previous.lastIndexOf("\n") + 1, 0), offset).length;

    throw new SyntaxError(error.message, error.lineNumber + previousLines, error.index + previous.length, error.column + previousColumn);
}

export function parseExpression(expression: string): IExpression
{
    if (expression in cache)
    {
        return cache[expression].clone() as IExpression;
    }

    return cache[expression] = Expression.parse(expression);
}

export function parseInterpolation(expression: string): IArrayExpression
{
    if (expression in cache)
    {
        return cache[expression].clone() as IArrayExpression;
    }

    return cache[expression] = InterpolatedExpression.parse(expression);
}

export function parseDestructuredPattern(expression: string): IPattern
{
    if (expression in cache)
    {
        return cache[expression].clone() as IPattern;
    }

    try
    {
        return cache[expression] = (parseExpression(`(${expression}) => 0`) as IArrowFunctionExpression).parameters[0];
    }
    catch (error)
    {
        assert(error instanceof SyntaxError);

        const message = error.message == "Duplicate parameter name not allowed in this context"
            ? "Cannot redeclare block-scoped variable"
            : error.message;

        throw new SyntaxError(message, error.lineNumber, error.index - 1, expression.includes("\n") ? error.column : error.column - 1);
    }
}

export function parseForLoopStatement(expression: string): { operator: "of" | "in", left: IPattern | IIdentifier, right: IExpression }
{
    if (!forExpression.test(expression))
    {
        throw new Error("Invalid for-loop statement");
    }

    const [, rawLeft, operator, rawRigth] = Array.from(forExpression.exec(expression)!) as [string, string, "in" | "of", string];

    const destructured = rawLeft.startsWith("[") || rawLeft.startsWith("{");

    const left  = parseStatement(destructured ? parseDestructuredPattern : parseExpression, expression, rawLeft);
    const right = parseStatement(parseExpression, expression, rawRigth);

    if (!TypeGuard.isIdentifier(left) && !TypeGuard.isArrayPattern(left) && !TypeGuard.isObjectPattern(left))
    {
        throw getOffsetSyntaxError(expression, rawLeft, new SyntaxError("Invalid left-hand side in for-loop", 1, 0, 1));
    }

    return { left, operator, right };
}
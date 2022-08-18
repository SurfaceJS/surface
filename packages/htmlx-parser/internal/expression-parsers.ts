import { assert } from "@surface/core";
import type
{
    ArrowFunctionExpression,
    IExpression,
    INode,
    IPattern,
    Identifier,
    TemplateLiteral,
} from "@surface/expression";
import { Parser, SyntaxError, TypeGuard } from "@surface/expression";
import InterpolatedExpression                 from "./interpolated-expression.js";
import { forExpression }                      from "./patterns.js";

const expressionCache:       Record<string, INode> = { };
const forLoopStatementCache: Record<string, ForLoopStatement> = { };

type ForLoopStatement =
{
    left:     IPattern | Identifier,
    operator: "of" | "in",
    right:    IExpression,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseStatement<TParser extends (expression: string) => any>(parser: TParser, statement: string, expression: string): ReturnType<TParser>
{
    try
    {
        return parser(expression);
    }
    catch (error)
    {
        assert(error instanceof SyntaxError);

        throw getOffsetSyntaxError(statement, expression, error);
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
    if (expression in expressionCache)
    {
        return expressionCache[expression] as IExpression;
    }

    return expressionCache[expression] = Parser.parse(expression);
}

export function parseInterpolation(expression: string): TemplateLiteral
{
    if (expression in expressionCache)
    {
        return expressionCache[expression] as TemplateLiteral;
    }

    return expressionCache[expression] = InterpolatedExpression.parse(expression);
}

export function parseDestructuredPattern(expression: string): IPattern
{
    const arrowExpression = `(${expression}) => 0`;

    if (arrowExpression in expressionCache)
    {
        return expressionCache[arrowExpression] as IPattern;
    }

    try
    {
        return expressionCache[arrowExpression] = (parseExpression(arrowExpression) as ArrowFunctionExpression).parameters[0]!;
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

export function parseForLoopStatement(expression: string): ForLoopStatement
{
    if (expression in forLoopStatementCache)
    {
        return forLoopStatementCache[expression]!;
    }

    if (!forExpression.test(expression))
    {
        throw new Error("Invalid for-loop statement");
    }

    const [, rawLeft, operator, rawRight] = Array.from(forExpression.exec(expression)!) as [string, string, "in" | "of", string];

    const destructured = rawLeft.startsWith("[") || rawLeft.startsWith("{");

    const left  = parseStatement(destructured ? parseDestructuredPattern : parseExpression, expression, rawLeft);
    const right = parseStatement(parseExpression, expression, rawRight);

    if (!TypeGuard.isIdentifier(left) && !TypeGuard.isArrayPattern(left) && !TypeGuard.isObjectPattern(left))
    {
        throw getOffsetSyntaxError(expression, rawLeft, new SyntaxError("Invalid left-hand side in for-loop", 1, 0, 1));
    }

    return forLoopStatementCache[expression] = { left, operator, right };
}

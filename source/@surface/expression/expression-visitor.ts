import ArrayExpression       from "./internal/expressions/array-expression";
import BinaryExpression      from "./internal/expressions/binary-expression";
import CallExpression        from "./internal/expressions/call-expression";
import ConditionalExpression from "./internal/expressions/conditional-expression";
import ConstantExpression    from "./internal/expressions/constant-expression";
import IExpression           from "./interfaces/expression";
import IdentifierExpression  from "./internal/expressions/identifier-expression";
import MemberExpression      from "./internal/expressions/member-expression";
import ObjectExpression      from "./internal/expressions/object-expression";
import PropertyExpression    from "./internal/expressions/property-expression";
import RegexExpression       from "./internal/expressions/regex-expression";
import TemplateExpression    from "./internal/expressions/template-expression";
import TypeGuard             from "./internal/type-guard";
import UnaryExpression       from "./internal/expressions/unary-expression";
import UpdateExpression      from "./internal/expressions/update-expression";

export default abstract class ExpressionVisitor
{
    protected visitArrayExpression(expression: ArrayExpression): IExpression
    {
        for (const element of expression.elements)
        {
            this.visit(element);
        }

        return expression;
    }

    protected visitBinaryExpression(expression: BinaryExpression): IExpression
    {
        this.visit(expression.left);
        this.visit(expression.right);

        return expression;
    }

    protected visitCallExpression(expression: CallExpression): IExpression
    {
        this.visit(expression.context);

        for (const arg of expression.args)
        {
            this.visit(arg);
        }

        return expression;
    }

    protected visitConditionalExpression(expression: ConditionalExpression): IExpression
    {
        this.visit(expression.condition);
        this.visit(expression.truthy);
        this.visit(expression.falsy);

        return expression;
    }

    protected visitConstantExpression(expression: ConstantExpression): IExpression
    {
        return expression;
    }

    protected visitIdentifierExpression(expression: IdentifierExpression): IExpression
    {
        return expression;
    }

    protected visitMemberExpression(expression: MemberExpression): IExpression
    {
        this.visit(expression.target);
        this.visit(expression.property);

        return expression;
    }

    protected visitObjectExpression(expression: ObjectExpression): IExpression
    {
        for (const property of expression.properties)
        {
            this.visit(property);
        }

        return expression;
    }

    protected visitPropertyExpression(expression: PropertyExpression): IExpression
    {
        this.visit(expression.key);
        this.visit(expression.value);

        return expression;
    }

    protected visitRegexExpression(expression: RegexExpression): IExpression
    {
        return expression;
    }

    protected visitTemplateExpression(expression: TemplateExpression): IExpression
    {
        for (const node of expression.expressions)
        {
            this.visit(node);
        }

        return expression;
    }

    protected visitUnaryExpression(expression: UnaryExpression): IExpression
    {
        this.visit(expression.expression);

        return expression;
    }

    protected visitUpdateExpression(expression: UpdateExpression): IExpression
    {
        this.visit(expression.expression);

        return expression;
    }

    public visit(expression: IExpression): IExpression
    {
        /* istanbul ignore else */
        if (TypeGuard.isArrayExpression(expression))
        {
            return this.visitArrayExpression(expression);
        }
        else if (TypeGuard.isBinaryExpression(expression))
        {
            return this.visitBinaryExpression(expression);
        }
        else if (TypeGuard.isCallExpression(expression))
        {
            return this.visitCallExpression(expression);
        }
        else if (TypeGuard.isConditionalExpression(expression))
        {
            return this.visitConditionalExpression(expression);
        }
        else if (TypeGuard.isConstantExpression(expression))
        {
            return this.visitConstantExpression(expression);
        }
        else if (TypeGuard.isIdentifierExpression(expression))
        {
            return this.visitIdentifierExpression(expression);
        }
        else if (TypeGuard.isMemberExpression(expression))
        {
            return this.visitMemberExpression(expression);
        }
        else if (TypeGuard.isObjectExpression(expression))
        {
            return this.visitObjectExpression(expression);
        }
        else if (TypeGuard.isPropertyExpression(expression))
        {
            return this.visitPropertyExpression(expression);
        }
        else if (TypeGuard.isRegexExpression(expression))
        {
            return this.visitRegexExpression(expression);
        }
        else if (TypeGuard.isTemplateExpression(expression))
        {
            return this.visitTemplateExpression(expression);
        }
        else if (TypeGuard.isUpdateExpression(expression))
        {
            return this.visitUpdateExpression(expression);
        }
        else if (TypeGuard.isUnaryExpression(expression))
        {
            return this.visitUnaryExpression(expression);
        }
        else
        {
            throw new Error("Unexpected expression");
        }
    }
}
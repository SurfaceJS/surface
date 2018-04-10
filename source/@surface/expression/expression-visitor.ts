import IArrayExpression       from "./interfaces/array-expression";
import IBinaryExpression      from "./interfaces/binary-expression";
import ICallExpression        from "./interfaces/call-expression";
import IConditionalExpression from "./interfaces/conditional-expression";
import IConstantExpression    from "./interfaces/constant-expression";
import IExpression            from "./interfaces/expression";
import IIdentifierExpression  from "./interfaces/identifier-expression";
import IMemberExpression      from "./interfaces/member-expression";
import IObjectExpression      from "./interfaces/object-expression";
import IPropertyExpression    from "./interfaces/property-expression";
import IRegexExpression       from "./interfaces/regex-expression";
import ITemplateExpression    from "./interfaces/template-expression";
import IUnaryExpression       from "./interfaces/unary-expression";
import IUpdateExpression      from "./interfaces/update-expression";
import TypeGuard              from "./internal/type-guard";

export default abstract class ExpressionVisitor
{
    protected visitArrayExpression(expression: IArrayExpression): IExpression
    {
        for (const element of expression.elements)
        {
            this.visit(element);
        }

        return expression;
    }

    protected visitBinaryExpression(expression: IBinaryExpression): IExpression
    {
        this.visit(expression.left);
        this.visit(expression.right);

        return expression;
    }

    protected visitCallExpression(expression: ICallExpression): IExpression
    {
        this.visit(expression.context);

        for (const arg of expression.args)
        {
            this.visit(arg);
        }

        return expression;
    }

    protected visitConditionalExpression(expression: IConditionalExpression): IExpression
    {
        this.visit(expression.condition);
        this.visit(expression.truthy);
        this.visit(expression.falsy);

        return expression;
    }

    protected visitConstantExpression(expression: IConstantExpression): IExpression
    {
        return expression;
    }

    protected visitIdentifierExpression(expression: IIdentifierExpression): IExpression
    {
        return expression;
    }

    protected visitMemberExpression(expression: IMemberExpression): IExpression
    {
        this.visit(expression.target);
        this.visit(expression.key);

        return expression;
    }

    protected visitObjectExpression(expression: IObjectExpression): IExpression
    {
        for (const property of expression.properties)
        {
            this.visit(property);
        }

        return expression;
    }

    protected visitPropertyExpression(expression: IPropertyExpression): IExpression
    {
        this.visit(expression.key);
        this.visit(expression.value);

        return expression;
    }

    protected visitRegexExpression(expression: IRegexExpression): IExpression
    {
        return expression;
    }

    protected visitTemplateExpression(expression: ITemplateExpression): IExpression
    {
        for (const node of expression.expressions)
        {
            this.visit(node);
        }

        return expression;
    }

    protected visitUnaryExpression(expression: IUnaryExpression): IExpression
    {
        this.visit(expression.expression);

        return expression;
    }

    protected visitUpdateExpression(expression: IUpdateExpression): IExpression
    {
        this.visit(expression.expression);

        return expression;
    }

    public visit(expression: IExpression): IExpression
    {
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
            throw new Error("Invalid expression");
        }
    }
}
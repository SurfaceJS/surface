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
import UnaryExpression       from "./internal/expressions/unary-expression";
import UpdateExpression      from "./internal/expressions/update-expression";

export default abstract class ExpressionVisitor
{
    public visit(expression: IExpression): IExpression
    {
        /* istanbul ignore else */
        if (expression instanceof ArrayExpression)
        {
            return this.visitArrayExpression(expression);
        }
        else if (expression instanceof BinaryExpression)
        {
            return this.visitBinaryExpression(expression);
        }
        else if (expression instanceof CallExpression)
        {
            return this.visitCallExpression(expression);
        }
        else if (expression instanceof ConditionalExpression)
        {
            return this.visitConditionalExpression(expression);
        }
        else if (expression instanceof ConstantExpression)
        {
            return this.visitConstantExpression(expression);
        }
        else if (expression instanceof IdentifierExpression)
        {
            return this.visitIdentifierExpression(expression);
        }
        else if (expression instanceof MemberExpression)
        {
            return this.visitMemberExpression(expression);
        }
        else if (expression instanceof ObjectExpression)
        {
            return this.visitObjectExpression(expression);
        }
        else if (expression instanceof PropertyExpression)
        {
            return this.visitPropertyExpression(expression);
        }
        else if (expression instanceof RegexExpression)
        {
            return this.visitRegexExpression(expression);
        }
        else if (expression instanceof TemplateExpression)
        {
            return this.visitTemplateExpression(expression);
        }
        else if (expression instanceof UpdateExpression)
        {
            return this.visitUpdateExpression(expression);
        }
        else if (expression instanceof UnaryExpression)
        {
            return this.visitUnaryExpression(expression);
        }
        else
        {
            throw new Error("Unexpected expression");
        }
    }

    public visitArrayExpression(expression: ArrayExpression): IExpression
    {
        for (const element of expression.elements)
        {
            this.visit(element);
        }

        return expression;
    }

    public visitBinaryExpression(expression: BinaryExpression): IExpression
    {
        this.visit(expression.left);
        this.visit(expression.right);

        return expression;
    }

    public visitCallExpression(expression: CallExpression): IExpression
    {
        this.visit(expression.context);

        for (const arg of expression.args)
        {
            this.visit(arg);
        }

        return expression;
    }

    public visitConditionalExpression(expression: ConditionalExpression): IExpression
    {
        this.visit(expression.condition);
        this.visit(expression.truthy);
        this.visit(expression.falsy);

        return expression;
    }

    public visitConstantExpression(expression: ConstantExpression): IExpression
    {
        return expression;
    }

    public visitIdentifierExpression(expression: IdentifierExpression): IExpression
    {
        return expression;
    }

    public visitMemberExpression(expression: MemberExpression): IExpression
    {
        this.visit(expression.target);
        this.visit(expression.property);

        return expression;
    }

    public visitObjectExpression(expression: ObjectExpression): IExpression
    {
        for (const property of expression.properties)
        {
            this.visit(property);
        }

        return expression;
    }

    public visitPropertyExpression(expression: PropertyExpression): IExpression
    {
        this.visit(expression.key);
        this.visit(expression.value);

        return expression;
    }

    public visitRegexExpression(expression: RegexExpression): IExpression
    {
        return expression;
    }

    public visitTemplateExpression(expression: TemplateExpression): IExpression
    {
        for (const node of expression.expressions)
        {
            this.visit(node);
        }

        return expression;
    }

    public visitUnaryExpression(expression: UnaryExpression): IExpression
    {
        this.visit(expression.expression);

        return expression;
    }

    public visitUpdateExpression(expression: UpdateExpression): IExpression
    {
        this.visit(expression.expression);

        return expression;
    }
}
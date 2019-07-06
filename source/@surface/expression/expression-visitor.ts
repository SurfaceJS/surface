import IArrayExpression       from "./interfaces/array-expression";
import IAssignmentExpression  from "./interfaces/assignment-expression";
import IBinaryExpression      from "./interfaces/binary-expression";
import ICallExpression        from "./interfaces/call-expression";
import IConditionalExpression from "./interfaces/conditional-expression";
import IIdentifier            from "./interfaces/identifier";
import ILiteral               from "./interfaces/literal";
import IMemberExpression      from "./interfaces/member-expression";
import INewExpression         from "./interfaces/new-expression";
import INode                  from "./interfaces/node";
import IObjectExpression      from "./interfaces/object-expression";
import IProperty              from "./interfaces/property";
import IRegExpLiteral         from "./interfaces/reg-exp-literal";
import ISpreadElement         from "./interfaces/spread-element";
import ITemplateLiteral       from "./interfaces/template-literal";
import IUnaryExpression       from "./interfaces/unary-expression";
import IUpdateExpression      from "./interfaces/update-expression";
import TypeGuard              from "./internal/type-guard";

export default abstract class ExpressionVisitor
{
    protected visit(expression: INode): INode
    {
        if (TypeGuard.isArrayExpression(expression))
        {
            return this.visitArrayExpression(expression);
        }
        else if (TypeGuard.isAssignmentExpression(expression))
        {
            return this.visitAssignmentExpression(expression);
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
        else if (TypeGuard.isLiteral(expression))
        {
            return this.visitLiteral(expression);
        }
        else if (TypeGuard.isIdentifier(expression))
        {
            return this.visitIdentifierExpression(expression);
        }
        else if (TypeGuard.isMemberExpression(expression))
        {
            return this.visitMemberExpression(expression);
        }
        else if (TypeGuard.isNewExpression(expression))
        {
            return this.visitNewExpression(expression);
        }
        else if (TypeGuard.isObjectExpression(expression))
        {
            return this.visitObjectExpression(expression);
        }
        else if (TypeGuard.isProperty(expression))
        {
            return this.visitPropertyExpression(expression);
        }
        else if (TypeGuard.isRegExpLiteral(expression))
        {
            return this.visitRegexExpression(expression);
        }
        else if (TypeGuard.isTemplateLiteral(expression))
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

    protected visitArrayExpression(expression: IArrayExpression): INode
    {
        for (const element of expression.elements)
        {
            if (element)
            {
                this.visit(element);
            }
        }

        return expression;
    }

    protected visitAssignmentExpression(expression: IAssignmentExpression): INode
    {
        this.visit(expression.left);
        this.visit(expression.right);

        return expression;
    }

    protected visitBinaryExpression(expression: IBinaryExpression): INode
    {
        this.visit(expression.left);
        this.visit(expression.right);

        return expression;
    }

    protected visitCallExpression(expression: ICallExpression): INode
    {
        this.visit(expression.thisArg);
        this.visit(expression.callee);

        for (const arg of expression.arguments)
        {
            this.visit(arg);
        }

        return expression;
    }

    protected visitConditionalExpression(expression: IConditionalExpression): INode
    {
        this.visit(expression.test);
        this.visit(expression.alternate);
        this.visit(expression.consequent);

        return expression;
    }

    protected visitLiteral(expression: ILiteral): INode
    {
        return expression;
    }

    protected visitIdentifierExpression(expression: IIdentifier): INode
    {
        return expression;
    }

    protected visitMemberExpression(expression: IMemberExpression): INode
    {
        this.visit(expression.object);
        this.visit(expression.property);

        return expression;
    }

    protected visitNewExpression(expression: INewExpression): INode
    {
        this.visit(expression.callee);

        for (const arg of expression.arguments)
        {
            this.visit(arg);
        }

        return expression;
    }

    protected visitObjectExpression(expression: IObjectExpression): INode
    {
        for (const entry of expression.properties)
        {
            this.visit(entry);
        }

        return expression;
    }

    protected visitPropertyExpression(expression: IProperty): INode
    {
        this.visit(expression.key);
        this.visit(expression.value);

        return expression;
    }

    protected visitRegexExpression(expression: IRegExpLiteral): INode
    {
        return expression;
    }

    protected visitSpreadExpression(node: ISpreadElement): INode
    {
        this.visit(node.argument);

        return node;
    }

    protected visitTemplateExpression(expression: ITemplateLiteral): INode
    {
        for (const node of expression.expressions)
        {
            this.visit(node);
        }

        return expression;
    }

    protected visitUnaryExpression(expression: IUnaryExpression): INode
    {
        this.visit(expression.argument);

        return expression;
    }

    protected visitUpdateExpression(expression: IUpdateExpression): INode
    {
        this.visit(expression.argument);

        return expression;
    }
}
import type IArrayExpression          from "./interfaces/array-expression";
import type IArrayPattern             from "./interfaces/array-pattern";
import type IArrowFunctionExpression  from "./interfaces/arrow-function-expression";
import type IAssignmentExpression     from "./interfaces/assignment-expression";
import type IAssignmentPattern        from "./interfaces/assignment-pattern";
import type IAssignmentProperty       from "./interfaces/assignment-property";
import type IBinaryExpression         from "./interfaces/binary-expression";
import type ICallExpression           from "./interfaces/call-expression";
import type ICoalesceExpression       from "./interfaces/coalesce-expression";
import type IConditionalExpression    from "./interfaces/conditional-expression";
import type IIdentifier               from "./interfaces/identifier";
import type ILiteral                  from "./interfaces/literal";
import type ILogicalExpression        from "./interfaces/logical-expression";
import type IMemberExpression         from "./interfaces/member-expression";
import type INewExpression            from "./interfaces/new-expression";
import type INode                     from "./interfaces/node";
import type IObjectExpression         from "./interfaces/object-expression";
import type IObjectPattern            from "./interfaces/object-pattern";
import type IParenthesizedExpression  from "./interfaces/parenthesized-expression";
import type IProperty                 from "./interfaces/property";
import type IRegExpLiteral            from "./interfaces/reg-exp-literal";
import type IRestElement              from "./interfaces/rest-element";
import type ISequenceExpression       from "./interfaces/sequence-expression";
import type ISpreadElement            from "./interfaces/spread-element";
import type ITaggedTemplateExpression from "./interfaces/tagged-template-expression";
import type ITemplateElement          from "./interfaces/template-element";
import type ITemplateLiteral          from "./interfaces/template-literal";
import type IThisExpression           from "./interfaces/this-expression";
import type IUnaryExpression          from "./interfaces/unary-expression";
import type IUpdateExpression         from "./interfaces/update-expression";
import TypeGuard                      from "./type-guard.js";

export default abstract class ExpressionVisitor
{
    protected visit(node: INode): INode
    {
        /* istanbul ignore else */
        if (TypeGuard.isArrayExpression(node))
        {
            return this.visitArrayExpression(node);
        }
        else if (TypeGuard.isArrayPattern(node))
        {
            return this.visitArrayPattern(node);
        }
        else if (TypeGuard.isArrowFunctionExpression(node))
        {
            return this.visitArrowFunctionExpression(node);
        }
        else if (TypeGuard.isAssignmentExpression(node))
        {
            return this.visitAssignmentExpression(node);
        }
        else if (TypeGuard.isAssignmentProperty(node))
        {
            return this.visitAssignmentProperty(node);
        }
        else if (TypeGuard.isAssignmentPattern(node))
        {
            return this.visitAssignmentPattern(node);
        }
        else if (TypeGuard.isBinaryExpression(node))
        {
            return this.visitBinaryExpression(node);
        }
        else if (TypeGuard.isCallExpression(node))
        {
            return this.visitCallExpression(node);
        }
        else if (TypeGuard.isCoalesceExpression(node))
        {
            return this.visitCoalesceExpression(node);
        }
        else if (TypeGuard.isConditionalExpression(node))
        {
            return this.visitConditionalExpression(node);
        }
        else if (TypeGuard.isIdentifier(node))
        {
            return this.visitIdentifier(node);
        }
        else if (TypeGuard.isLiteral(node))
        {
            return this.visitLiteral(node);
        }
        else if (TypeGuard.isLogicalExpression(node))
        {
            return this.visitLogicalExpression(node);
        }
        else if (TypeGuard.isMemberExpression(node))
        {
            return this.visitMemberExpression(node);
        }
        else if (TypeGuard.isNewExpression(node))
        {
            return this.visitNewExpression(node);
        }
        else if (TypeGuard.isObjectExpression(node))
        {
            return this.visitObjectExpression(node);
        }
        else if (TypeGuard.isObjectPattern(node))
        {
            return this.visitObjectPattern(node);
        }
        else if (TypeGuard.isParenthesizedExpression(node))
        {
            return this.visitParenthesizedExpression(node);
        }
        else if (TypeGuard.isProperty(node))
        {
            return this.visitProperty(node);
        }
        else if (TypeGuard.isRegExpLiteral(node))
        {
            return this.visitRegExpLiteral(node);
        }
        else if (TypeGuard.isRestElement(node))
        {
            return this.visitRestElement(node);
        }
        else if (TypeGuard.isSequenceExpression(node))
        {
            return this.visitSequenceExpression(node);
        }
        else if (TypeGuard.isSpreadElement(node))
        {
            return this.visitSpreadExpression(node);
        }
        else if (TypeGuard.isTaggedTemplateExpression(node))
        {
            return this.visitTaggedTemplateExpression(node);
        }
        else if (TypeGuard.isTemplateLiteral(node))
        {
            return this.visitTemplateLiteral(node);
        }
        else if (TypeGuard.isTemplateElement(node))
        {
            return this.visitTemplateElement(node);
        }
        else if (TypeGuard.isThisExpression(node))
        {
            return this.visitThisExpression(node);
        }
        else if (TypeGuard.isUpdateExpression(node))
        {
            return this.visitUpdateExpression(node);
        }
        else if (TypeGuard.isUnaryExpression(node))
        {
            return this.visitUnaryExpression(node);
        }

        return node;
    }

    protected visitArrayExpression(node: IArrayExpression): INode
    {
        for (const element of node.elements)
        {
            if (element)
            {
                this.visit(element);
            }
        }

        return node;
    }

    protected visitArrayPattern(node: IArrayPattern): INode
    {
        for (const element of node.elements)
        {
            if (element)
            {
                this.visit(element);
            }
        }

        return node;
    }

    protected visitArrowFunctionExpression(node: IArrowFunctionExpression): INode
    {
        for (const parameter of node.parameters)
        {
            this.visit(parameter);
        }

        this.visit(node.body);

        return node;
    }

    protected visitAssignmentExpression(node: IAssignmentExpression): INode
    {
        this.visit(node.left);
        this.visit(node.right);

        return node;
    }

    protected visitAssignmentProperty(node: IAssignmentProperty): INode
    {
        this.visit(node.key);
        this.visit(node.value);

        return node;
    }

    protected visitAssignmentPattern(node: IAssignmentPattern): INode
    {
        this.visit(node.left);
        this.visit(node.right);

        return node;
    }

    protected visitBinaryExpression(node: IBinaryExpression): INode
    {
        this.visit(node.left);
        this.visit(node.right);

        return node;
    }

    protected visitCallExpression(node: ICallExpression): INode
    {
        this.visit(node.callee);

        for (const arg of node.arguments)
        {
            this.visit(arg);
        }

        return node;
    }

    protected visitCoalesceExpression(node: ICoalesceExpression): INode
    {
        this.visit(node.left);
        this.visit(node.right);

        return node;
    }

    protected visitConditionalExpression(node: IConditionalExpression): INode
    {
        this.visit(node.test);
        this.visit(node.alternate);
        this.visit(node.consequent);

        return node;
    }

    protected visitIdentifier(node: IIdentifier): INode
    {
        return node;
    }

    protected visitLiteral(node: ILiteral): INode
    {
        return node;
    }

    protected visitLogicalExpression(node: ILogicalExpression): INode
    {
        this.visit(node.left);
        this.visit(node.right);

        return node;
    }

    protected visitMemberExpression(node: IMemberExpression): INode
    {
        this.visit(node.object);
        this.visit(node.property);

        return node;
    }

    protected visitNewExpression(node: INewExpression): INode
    {
        this.visit(node.callee);

        for (const arg of node.arguments)
        {
            this.visit(arg);
        }

        return node;
    }

    protected visitObjectExpression(node: IObjectExpression): INode
    {
        for (const entry of node.properties)
        {
            this.visit(entry);
        }

        return node;
    }

    protected visitObjectPattern(node: IObjectPattern): INode
    {
        for (const entry of node.properties)
        {
            this.visit(entry);
        }

        return node;
    }

    protected visitParenthesizedExpression(node: IParenthesizedExpression): INode
    {
        this.visit(node.argument);

        return node;
    }

    protected visitProperty(node: IProperty): INode
    {
        this.visit(node.key);
        this.visit(node.value);

        return node;
    }

    protected visitRegExpLiteral(node: IRegExpLiteral): INode
    {
        return node;
    }

    protected visitRestElement(node: IRestElement): INode
    {
        this.visit(node.argument);

        return node;
    }

    protected visitSequenceExpression(node: ISequenceExpression): INode
    {
        for (const expression of node.expressions)
        {
            this.visit(expression);
        }

        return node;
    }

    protected visitSpreadExpression(node: ISpreadElement): INode
    {
        this.visit(node.argument);

        return node;
    }

    protected visitTaggedTemplateExpression(node: ITaggedTemplateExpression): INode
    {
        this.visit(node.callee);
        this.visit(node.quasi);

        return node;
    }

    protected visitTemplateLiteral(node: ITemplateLiteral): INode
    {
        for (const quasi of node.quasis)
        {
            this.visit(quasi);
        }

        for (const expression of node.expressions)
        {
            this.visit(expression);
        }

        return node;
    }

    protected visitTemplateElement(node: ITemplateElement): INode
    {
        return node;
    }

    protected visitThisExpression(node: IThisExpression): INode
    {
        return node;
    }

    protected visitUnaryExpression(node: IUnaryExpression): INode
    {
        this.visit(node.argument);

        return node;
    }

    protected visitUpdateExpression(node: IUpdateExpression): INode
    {
        this.visit(node.argument);

        return node;
    }
}
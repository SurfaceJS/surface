
import type AssignmentProperty       from "./elements/assignment-property.js";
import type Property                 from "./elements/property.js";
import type SpreadElement            from "./elements/spread-element.js";
import type TemplateElement          from "./elements/template-element.js";
import type ArrayExpression          from "./expressions/array-expression.js";
import type ArrowFunctionExpression  from "./expressions/arrow-function-expression.js";
import type AssignmentExpression     from "./expressions/assignment-expression.js";
import type BinaryExpression         from "./expressions/binary-expression.js";
import type CallExpression           from "./expressions/call-expression.js";
import type ChainExpression          from "./expressions/chain-expression.js";
import type ConditionalExpression    from "./expressions/conditional-expression.js";
import type Identifier               from "./expressions/identifier.js";
import type Literal                  from "./expressions/literal.js";
import type LogicalExpression        from "./expressions/logical-expression.js";
import type MemberExpression         from "./expressions/member-expression.js";
import type NewExpression            from "./expressions/new-expression.js";
import type ObjectExpression         from "./expressions/object-expression.js";
import type ParenthesizedExpression  from "./expressions/parenthesized-expression.js";
import type SequenceExpression       from "./expressions/sequence-expression.js";
import type TaggedTemplateExpression from "./expressions/tagged-template-expression.js";
import type TemplateLiteral          from "./expressions/template-literal.js";
import type ThisExpression           from "./expressions/this-expression.js";
import type UnaryExpression          from "./expressions/unary-expression.js";
import type UpdateExpression         from "./expressions/update-expression.js";
import type INode                    from "./interfaces/node";
import type ArrayPattern             from "./patterns/array-pattern.js";
import type AssignmentPattern        from "./patterns/assignment-pattern.js";
import type ObjectPattern            from "./patterns/object-pattern.js";
import type RestElement              from "./patterns/rest-element.js";
import TypeGuard                     from "./type-guard.js";

export default abstract class ExpressionVisitor
{
    protected visit(node: INode): INode
    {
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
        else if (TypeGuard.isChainExpression(node))
        {
            return this.visitChainExpression(node);
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
        } /* c8 ignore next 3 */

        return node;
    }

    protected visitArrayExpression(node: ArrayExpression): INode
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

    protected visitArrayPattern(node: ArrayPattern): INode
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

    protected visitArrowFunctionExpression(node: ArrowFunctionExpression): INode
    {
        for (const parameter of node.parameters)
        {
            this.visit(parameter);
        }

        this.visit(node.body);

        return node;
    }

    protected visitAssignmentExpression(node: AssignmentExpression): INode
    {
        this.visit(node.left);
        this.visit(node.right);

        return node;
    }

    protected visitAssignmentProperty(node: AssignmentProperty): INode
    {
        this.visit(node.key);
        this.visit(node.value);

        return node;
    }

    protected visitAssignmentPattern(node: AssignmentPattern): INode
    {
        this.visit(node.left);
        this.visit(node.right);

        return node;
    }

    protected visitBinaryExpression(node: BinaryExpression): INode
    {
        this.visit(node.left);
        this.visit(node.right);

        return node;
    }

    protected visitCallExpression(node: CallExpression): INode
    {
        this.visit(node.callee);

        for (const arg of node.arguments)
        {
            this.visit(arg);
        }

        return node;
    }

    protected visitChainExpression(node: ChainExpression): INode
    {
        this.visit(node.expression);

        return node;
    }

    protected visitConditionalExpression(node: ConditionalExpression): INode
    {
        this.visit(node.test);
        this.visit(node.alternate);
        this.visit(node.consequent);

        return node;
    }

    protected visitIdentifier(node: Identifier): INode
    {
        return node;
    }

    protected visitLiteral(node: Literal): INode
    {
        return node;
    }

    protected visitLogicalExpression(node: LogicalExpression): INode
    {
        this.visit(node.left);
        this.visit(node.right);

        return node;
    }

    protected visitMemberExpression(node: MemberExpression): INode
    {
        this.visit(node.object);
        this.visit(node.property);

        return node;
    }

    protected visitNewExpression(node: NewExpression): INode
    {
        this.visit(node.callee);

        for (const arg of node.arguments)
        {
            this.visit(arg);
        }

        return node;
    }

    protected visitObjectExpression(node: ObjectExpression): INode
    {
        for (const entry of node.properties)
        {
            this.visit(entry);
        }

        return node;
    }

    protected visitObjectPattern(node: ObjectPattern): INode
    {
        for (const entry of node.properties)
        {
            this.visit(entry);
        }

        return node;
    }

    protected visitParenthesizedExpression(node: ParenthesizedExpression): INode
    {
        this.visit(node.argument);

        return node;
    }

    protected visitProperty(node: Property): INode
    {
        this.visit(node.key);
        this.visit(node.value);

        return node;
    }

    protected visitRestElement(node: RestElement): INode
    {
        this.visit(node.argument);

        return node;
    }

    protected visitSequenceExpression(node: SequenceExpression): INode
    {
        for (const expression of node.expressions)
        {
            this.visit(expression);
        }

        return node;
    }

    protected visitSpreadExpression(node: SpreadElement): INode
    {
        this.visit(node.argument);

        return node;
    }

    protected visitTaggedTemplateExpression(node: TaggedTemplateExpression): INode
    {
        this.visit(node.callee);
        this.visit(node.quasi);

        return node;
    }

    protected visitTemplateLiteral(node: TemplateLiteral): INode
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

    protected visitTemplateElement(node: TemplateElement): INode
    {
        return node;
    }

    protected visitThisExpression(node: ThisExpression): INode
    {
        return node;
    }

    protected visitUnaryExpression(node: UnaryExpression): INode
    {
        this.visit(node.argument);

        return node;
    }

    protected visitUpdateExpression(node: UpdateExpression): INode
    {
        this.visit(node.argument);

        return node;
    }
}
import AssignmentProperty             from "./elements/assignment-property.js";
import Property                       from "./elements/property.js";
import SpreadElement                  from "./elements/spread-element.js";
import ExpressionVisitor              from "./expression-visitor.js";
import ArrayExpression                from "./expressions/array-expression.js";
import ArrowFunctionExpression        from "./expressions/arrow-function-expression.js";
import AssignmentExpression           from "./expressions/assignment-expression.js";
import BinaryExpression               from "./expressions/binary-expression.js";
import CallExpression                 from "./expressions/call-expression.js";
import ChainExpression                from "./expressions/chain-expression.js";
import ConditionalExpression          from "./expressions/conditional-expression.js";
import LogicalExpression              from "./expressions/logical-expression.js";
import MemberExpression               from "./expressions/member-expression.js";
import NewExpression                  from "./expressions/new-expression.js";
import ObjectExpression               from "./expressions/object-expression.js";
import ParenthesizedExpression        from "./expressions/parenthesized-expression.js";
import SequenceExpression             from "./expressions/sequence-expression.js";
import TaggedTemplateExpression       from "./expressions/tagged-template-expression.js";
import TemplateLiteral                from "./expressions/template-literal.js";
import UnaryExpression                from "./expressions/unary-expression.js";
import UpdateExpression               from "./expressions/update-expression.js";
import type IArrayExpression          from "./interfaces/array-expression";
import type IArrayPattern             from "./interfaces/array-pattern";
import type IArrowFunctionExpression  from "./interfaces/arrow-function-expression";
import type IAssignmentExpression     from "./interfaces/assignment-expression";
import type IAssignmentPattern        from "./interfaces/assignment-pattern";
import type IAssignmentProperty       from "./interfaces/assignment-property";
import type IBinaryExpression         from "./interfaces/binary-expression";
import type ICallExpression           from "./interfaces/call-expression";
import type IChainExpression          from "./interfaces/chain-expression";
import type IConditionalExpression    from "./interfaces/conditional-expression";
import type IExpression               from "./interfaces/expression.js";
import type IIdentifier               from "./interfaces/identifier";
import type ILogicalExpression        from "./interfaces/logical-expression";
import type IMemberExpression         from "./interfaces/member-expression";
import type INewExpression            from "./interfaces/new-expression";
import type INode                     from "./interfaces/node";
import type IObjectExpression         from "./interfaces/object-expression";
import type IObjectPattern            from "./interfaces/object-pattern";
import type IParenthesizedExpression  from "./interfaces/parenthesized-expression";
import type IPattern                  from "./interfaces/pattern.js";
import type IProperty                 from "./interfaces/property";
import type IRestElement              from "./interfaces/rest-element";
import type ISequenceExpression       from "./interfaces/sequence-expression";
import type ISpreadElement            from "./interfaces/spread-element";
import type ITaggedTemplateExpression from "./interfaces/tagged-template-expression";
import type ITemplateElement          from "./interfaces/template-element";
import type ITemplateLiteral          from "./interfaces/template-literal";
import type IUnaryExpression          from "./interfaces/unary-expression";
import type IUpdateExpression         from "./interfaces/update-expression";
import ArrayPattern                   from "./patterns/array-pattern.js";
import AssignmentPattern              from "./patterns/assignment-pattern.js";
import ObjectPattern                  from "./patterns/object-pattern.js";
import RestElement                    from "./patterns/rest-element.js";

export default abstract class ExpressionRewriterVisitor extends ExpressionVisitor
{
    protected override visitArrayExpression(node: IArrayExpression): INode
    {
        return new ArrayExpression(node.elements.map(x => x ? this.visit(x) as IExpression : x));
    }

    protected override visitArrayPattern(node: IArrayPattern): INode
    {
        return new ArrayPattern(node.elements.map(x => x ? this.visit(x) as IPattern : x));
    }

    protected visitArrowFunctionExpression(node: IArrowFunctionExpression): INode
    {
        return new ArrowFunctionExpression(node.parameters.map(x => this.visit(x) as IPattern), this.visit(node.body) as IExpression);
    }

    protected visitAssignmentExpression(node: IAssignmentExpression): INode
    {
        return new AssignmentExpression(this.visit(node.left) as IIdentifier | IMemberExpression, this.visit(node.right) as IExpression, node.operator);
    }

    protected visitAssignmentPattern(node: IAssignmentPattern): INode
    {
        return new AssignmentPattern(this.visit(node.left) as IPattern, this.visit(node.right) as IExpression);
    }

    protected visitAssignmentProperty(node: IAssignmentProperty): INode
    {
        return new AssignmentProperty(this.visit(node.key) as IExpression, this.visit(node.value) as IPattern, node.computed, node.shorthand);
    }

    protected visitBinaryExpression(node: IBinaryExpression): INode
    {
        return new BinaryExpression(this.visit(node.left) as IExpression, this.visit(node.right) as IExpression, node.operator);
    }

    protected visitCallExpression(node: ICallExpression): INode
    {
        return new CallExpression(this.visit(node.callee) as IExpression, node.arguments.map(x => this.visit(x) as IExpression));
    }

    protected visitChainExpression(node: IChainExpression): INode
    {
        return new ChainExpression(this.visit(node.expression) as IExpression);
    }

    protected visitConditionalExpression(node: IConditionalExpression): INode
    {
        return new ConditionalExpression(this.visit(node.test) as IExpression, this.visit(node.alternate) as IExpression, this.visit(node.consequent) as IExpression);
    }

    protected visitLogicalExpression(node: ILogicalExpression): INode
    {
        return new LogicalExpression(this.visit(node.left) as IExpression, this.visit(node.right) as IExpression, node.operator);
    }

    protected visitMemberExpression(node: IMemberExpression): INode
    {
        return new MemberExpression(this.visit(node.object) as IExpression, this.visit(node.property) as IExpression, node.computed, node.optional);
    }

    protected visitNewExpression(node: INewExpression): INode
    {
        return new NewExpression(this.visit(node.callee) as IExpression, node.arguments.map(x => this.visit(x) as IExpression));
    }

    protected visitObjectExpression(node: IObjectExpression): INode
    {
        return new ObjectExpression(node.properties.map(x => this.visit(x) as ISpreadElement | IProperty));
    }

    protected visitObjectPattern(node: IObjectPattern): INode
    {
        return new ObjectPattern(node.properties.map(x => this.visit(x) as IAssignmentProperty | IRestElement));
    }

    protected visitParenthesizedExpression(node: IParenthesizedExpression): INode
    {
        return new ParenthesizedExpression(this.visit(node.argument) as IExpression);
    }

    protected visitProperty(node: IProperty): INode
    {
        return new Property(this.visit(node.key) as IExpression, this.visit(node.value) as IExpression, node.computed, node.shorthand);
    }

    protected visitRestElement(node: IRestElement): INode
    {
        return new RestElement(this.visit(node.argument) as IPattern);
    }

    protected visitSequenceExpression(node: ISequenceExpression): INode
    {
        return new SequenceExpression(node.expressions.map(x => this.visit(x) as IExpression));
    }

    protected visitSpreadExpression(node: ISpreadElement): INode
    {
        return new SpreadElement(this.visit(node.argument) as IExpression);
    }

    protected visitTaggedTemplateExpression(node: ITaggedTemplateExpression): INode
    {
        return new TaggedTemplateExpression(this.visit(node.callee) as IExpression, this.visit(node.quasi) as ITemplateLiteral);
    }

    protected visitTemplateLiteral(node: ITemplateLiteral): INode
    {
        return new TemplateLiteral(node.quasis.map(x => this.visit(x) as ITemplateElement), node.expressions.map(x => this.visit(x) as IExpression));
    }

    protected visitUnaryExpression(node: IUnaryExpression): INode
    {
        return new UnaryExpression(this.visit(node.argument) as IExpression, node.operator);
    }

    protected visitUpdateExpression(node: IUpdateExpression): INode
    {
        return new UpdateExpression(this.visit(node.argument) as IIdentifier | IMemberExpression, node.operator, node.prefix);
    }
}
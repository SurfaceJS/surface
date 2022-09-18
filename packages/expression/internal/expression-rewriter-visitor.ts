import AssignmentProperty       from "./elements/assignment-property.js";
import Property                 from "./elements/property.js";
import SpreadElement            from "./elements/spread-element.js";
import type TemplateElement     from "./elements/template-element.js";
import ExpressionVisitor        from "./expression-visitor.js";
import ArrayExpression          from "./expressions/array-expression.js";
import ArrowFunctionExpression  from "./expressions/arrow-function-expression.js";
import AssignmentExpression     from "./expressions/assignment-expression.js";
import BinaryExpression         from "./expressions/binary-expression.js";
import CallExpression           from "./expressions/call-expression.js";
import ChainExpression          from "./expressions/chain-expression.js";
import ConditionalExpression    from "./expressions/conditional-expression.js";
import type Identifier          from "./expressions/identifier.js";
import LogicalExpression        from "./expressions/logical-expression.js";
import MemberExpression         from "./expressions/member-expression.js";
import NewExpression            from "./expressions/new-expression.js";
import ObjectExpression         from "./expressions/object-expression.js";
import ParenthesizedExpression  from "./expressions/parenthesized-expression.js";
import SequenceExpression       from "./expressions/sequence-expression.js";
import TaggedTemplateExpression from "./expressions/tagged-template-expression.js";
import TemplateLiteral          from "./expressions/template-literal.js";
import UnaryExpression          from "./expressions/unary-expression.js";
import UpdateExpression         from "./expressions/update-expression.js";
import type IExpression         from "./interfaces/expression.js";
import type INode               from "./interfaces/node.js";
import type IPattern            from "./interfaces/pattern.js";
import ArrayPattern             from "./patterns/array-pattern.js";
import AssignmentPattern        from "./patterns/assignment-pattern.js";
import ObjectPattern            from "./patterns/object-pattern.js";
import RestElement              from "./patterns/rest-element.js";

export default abstract class ExpressionRewriterVisitor extends ExpressionVisitor
{
    protected override visitArrayExpression(node: ArrayExpression): INode
    {
        return new ArrayExpression(node.elements.map(x => x ? this.visit(x) as IExpression : x));
    }

    protected override visitArrayPattern(node: ArrayPattern): INode
    {
        return new ArrayPattern(node.elements.map(x => x ? this.visit(x) as IPattern : x));
    }

    protected override visitArrowFunctionExpression(node: ArrowFunctionExpression): INode
    {
        return new ArrowFunctionExpression(node.parameters.map(x => this.visit(x) as IPattern), this.visit(node.body) as IExpression);
    }

    protected override visitAssignmentExpression(node: AssignmentExpression): INode
    {
        return new AssignmentExpression(this.visit(node.left) as Identifier | MemberExpression, this.visit(node.right) as IExpression, node.operator);
    }

    protected override visitAssignmentPattern(node: AssignmentPattern): INode
    {
        return new AssignmentPattern(this.visit(node.left) as IPattern, this.visit(node.right) as IExpression);
    }

    protected override visitAssignmentProperty(node: AssignmentProperty): INode
    {
        return new AssignmentProperty(this.visit(node.key) as IExpression, this.visit(node.value) as IPattern, node.computed, node.shorthand);
    }

    protected override visitBinaryExpression(node: BinaryExpression): INode
    {
        return new BinaryExpression(this.visit(node.left) as IExpression, this.visit(node.right) as IExpression, node.operator);
    }

    protected override visitCallExpression(node: CallExpression): INode
    {
        return new CallExpression(this.visit(node.callee) as IExpression, node.arguments.map(x => this.visit(x) as IExpression));
    }

    protected override visitChainExpression(node: ChainExpression): INode
    {
        return new ChainExpression(this.visit(node.expression) as IExpression);
    }

    protected override visitConditionalExpression(node: ConditionalExpression): INode
    {
        return new ConditionalExpression(this.visit(node.test) as IExpression, this.visit(node.alternate) as IExpression, this.visit(node.consequent) as IExpression);
    }

    protected override visitLogicalExpression(node: LogicalExpression): INode
    {
        return new LogicalExpression(this.visit(node.left) as IExpression, this.visit(node.right) as IExpression, node.operator);
    }

    protected override visitMemberExpression(node: MemberExpression): INode
    {
        return new MemberExpression(this.visit(node.object) as IExpression, this.visit(node.property) as IExpression, node.computed, node.optional);
    }

    protected override visitNewExpression(node: NewExpression): INode
    {
        return new NewExpression(this.visit(node.callee) as IExpression, node.arguments.map(x => this.visit(x) as IExpression));
    }

    protected override visitObjectExpression(node: ObjectExpression): INode
    {
        return new ObjectExpression(node.properties.map(x => this.visit(x) as SpreadElement | Property));
    }

    protected override visitObjectPattern(node: ObjectPattern): INode
    {
        return new ObjectPattern(node.properties.map(x => this.visit(x) as AssignmentProperty | RestElement));
    }

    protected override visitParenthesizedExpression(node: ParenthesizedExpression): INode
    {
        return new ParenthesizedExpression(this.visit(node.argument) as IExpression);
    }

    protected override visitProperty(node: Property): INode
    {
        return new Property(this.visit(node.key) as IExpression, this.visit(node.value) as IExpression, node.computed, node.shorthand);
    }

    protected override visitRestElement(node: RestElement): INode
    {
        return new RestElement(this.visit(node.argument) as IPattern);
    }

    protected override visitSequenceExpression(node: SequenceExpression): INode
    {
        return new SequenceExpression(node.expressions.map(x => this.visit(x) as IExpression));
    }

    protected override visitSpreadExpression(node: SpreadElement): INode
    {
        return new SpreadElement(this.visit(node.argument) as IExpression);
    }

    protected override visitTaggedTemplateExpression(node: TaggedTemplateExpression): INode
    {
        return new TaggedTemplateExpression(this.visit(node.callee) as IExpression, this.visit(node.quasi) as TemplateLiteral);
    }

    protected override visitTemplateLiteral(node: TemplateLiteral): INode
    {
        return new TemplateLiteral(node.quasis.map(x => this.visit(x) as TemplateElement), node.expressions.map(x => this.visit(x) as IExpression));
    }

    protected override visitUnaryExpression(node: UnaryExpression): INode
    {
        return new UnaryExpression(this.visit(node.argument) as IExpression, node.operator);
    }

    protected override visitUpdateExpression(node: UpdateExpression): INode
    {
        return new UpdateExpression(this.visit(node.argument) as Identifier | MemberExpression, node.operator, node.prefix);
    }
}

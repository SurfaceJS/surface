import ExpressionVisitor     from "../../expression-visitor";
import IExpression           from "../../interfaces/expression";
import ArrayExpression       from "../../internal/expressions/array-expression";
import BinaryExpression      from "../../internal/expressions/binary-expression";
import CallExpression        from "../../internal/expressions/call-expression";
import ConditionalExpression from "../../internal/expressions/conditional-expression";
import ConstantExpression    from "../../internal/expressions/constant-expression";
import IdentifierExpression  from "../../internal/expressions/identifier-expression";
import MemberExpression      from "../../internal/expressions/member-expression";
import ObjectExpression      from "../../internal/expressions/object-expression";
import PropertyExpression    from "../../internal/expressions/property-expression";
import RegexExpression       from "../../internal/expressions/regex-expression";
import TemplateExpression    from "../../internal/expressions/template-expression";
import UnaryExpression       from "../../internal/expressions/unary-expression";
import UpdateExpression      from "../../internal/expressions/update-expression";

export default class FixtureVisitor extends ExpressionVisitor
{
    private readonly visited: Array<string> = [];
    protected visitArrayExpression(expression: ArrayExpression): IExpression
    {
        this.visited.push(expression.constructor.name);

        super.visitArrayExpression(expression);

        return expression;
    }

    protected visitBinaryExpression(expression: BinaryExpression): IExpression
    {
        this.visited.push(expression.constructor.name);

        super.visitBinaryExpression(expression);

        return expression;
    }

    protected visitCallExpression(expression: CallExpression): IExpression
    {
        this.visited.push(expression.constructor.name);

        super.visitCallExpression(expression);

        return expression;
    }

    protected visitConditionalExpression(expression: ConditionalExpression): IExpression
    {
        this.visited.push(expression.constructor.name);

        super.visitConditionalExpression(expression);

        return expression;
    }

    protected visitConstantExpression(expression: ConstantExpression): IExpression
    {
        this.visited.push(expression.constructor.name);

        super.visitConstantExpression(expression);

        return expression;
    }

    protected visitIdentifierExpression(expression: IdentifierExpression): IExpression
    {
        this.visited.push(expression.constructor.name);

        super.visitIdentifierExpression(expression);

        return expression;
    }

    protected visitMemberExpression(expression: MemberExpression): IExpression
    {
        this.visited.push(expression.constructor.name);

        super.visitMemberExpression(expression);

        return expression;
    }

    protected visitObjectExpression(expression: ObjectExpression): IExpression
    {
        this.visited.push(expression.constructor.name);

        super.visitObjectExpression(expression);

        return expression;
    }

    protected visitPropertyExpression(expression: PropertyExpression): IExpression
    {
        this.visited.push(expression.constructor.name);

        super.visitPropertyExpression(expression);

        return expression;
    }

    protected visitRegexExpression(expression: RegexExpression): IExpression
    {
        this.visited.push(expression.constructor.name);

        super.visitRegexExpression(expression);

        return expression;
    }

    protected visitTemplateExpression(expression: TemplateExpression): IExpression
    {
        this.visited.push(expression.constructor.name);

        super.visitTemplateExpression(expression);

        return expression;
    }

    protected visitUnaryExpression(expression: UnaryExpression): IExpression
    {
        this.visited.push(expression.constructor.name);

        super.visitUnaryExpression(expression);

        return expression;
    }

    protected visitUpdateExpression(expression: UpdateExpression): IExpression
    {
        this.visited.push(expression.constructor.name);

        super.visitUpdateExpression(expression);

        return expression;
    }

    public visit(expression: IExpression): IExpression
    {
        super.visit(expression);

        return { cache: "", type: -1, evaluate: () => this.visited.join(" > ") };
    }
}
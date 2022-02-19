import type
{
    ArrayPattern,
    ArrowFunctionExpression,
    AssignmentExpression,
    AssignmentPattern,
    AssignmentProperty,
    CallExpression,
    ConditionalExpression,
    INode,
    Identifier,
    LogicalExpression,
    MemberExpression,
    NewExpression,
    ParenthesizedExpression,
    Property,
    RestElement,
    TaggedTemplateExpression,
    ThisExpression,
    UpdateExpression,
} from "@surface/expression";
import
{
    ExpressionVisitor,
    NodeType,
    TypeGuard,
} from "@surface/expression";

export default class ObserverVisitor extends ExpressionVisitor
{
    private readonly paths: string[][] = [];

    private brokenPath: boolean = false;
    private stack: string[]     = [];

    public static observe(expression: INode): string[][]
    {
        const visitor = new ObserverVisitor();

        visitor.visit(expression);

        visitor.commit();

        return visitor.paths;
    }

    private commit(): void
    {
        if (this.stack.length > 1)
        {
            this.paths.push([...this.stack]);
        }

        this.stack = [];
    }

    private reset(): void
    {
        this.brokenPath = false;
        this.stack      = [];
    }

    private rollback(): void
    {
        this.brokenPath = true;
        this.stack      = [];
    }

    protected visitArrayPattern(expression: ArrayPattern): INode
    {
        for (const element of expression.elements)
        {
            if (element && !TypeGuard.isIdentifier(element))
            {
                this.visit(element);
            }
        }

        return expression;
    }

    protected visitArrowFunctionExpression(expression: ArrowFunctionExpression): INode
    {
        for (const paramenter of expression.parameters)
        {
            if (!TypeGuard.isIdentifier(paramenter))
            {
                this.visit(paramenter);
            }
        }

        return expression;
    }

    protected visitAssignmentExpression(expression: AssignmentExpression): INode
    {
        this.visit(expression.right);

        return expression;
    }

    protected visitAssignmentPattern(expression: AssignmentPattern): INode
    {
        this.visit(expression.right);

        return expression;
    }

    protected visitAssignmentProperty(expression: AssignmentProperty): INode
    {
        if (TypeGuard.isAssignmentPattern(expression.value))
        {
            this.visitAssignmentPattern(expression.value);
        }

        return expression;
    }

    protected visitCallExpression(expression: CallExpression): INode
    {
        this.rollback();

        this.visit(expression.callee);

        this.reset();

        expression.arguments.forEach(this.visit.bind(this));

        return expression;
    }

    protected visitLogicalExpression(expression: LogicalExpression): INode
    {
        if (expression.operator == "??")
        {
            this.visit(expression.left);
        }
        else
        {
            super.visitLogicalExpression(expression);
        }

        return expression;
    }

    protected visitConditionalExpression(expression: ConditionalExpression): INode
    {
        this.visit(expression.test);

        return expression;
    }

    protected visitIdentifier(expression: Identifier): INode
    {
        if (expression.name != "undefined")
        {
            this.stack.unshift(expression.name);

            this.commit();
        }

        return expression;
    }

    protected visitMemberExpression(expression: MemberExpression): INode
    {
        if (expression.computed && expression.property.type != NodeType.Literal)
        {
            this.reset();

            this.visit(expression.property);
        }
        else if (expression.optional)
        {
            this.rollback();
        }
        else if (!this.brokenPath)
        {
            const key = TypeGuard.isIdentifier(expression.property) ? expression.property.name : `${expression.property.evaluate({ })}`;

            this.stack.unshift(key);
        }

        this.visit(expression.object);

        return expression;
    }

    protected visitNewExpression(expression: NewExpression): INode
    {
        this.rollback();

        this.visit(expression.callee);

        this.reset();

        expression.arguments.forEach(this.visit.bind(this));

        return expression;
    }

    protected visitParenthesizedExpression(expression: ParenthesizedExpression): INode
    {
        this.reset();

        this.visit(expression.argument);

        return expression;
    }

    protected visitProperty(expression: Property): INode
    {
        if (expression.computed)
        {
            this.visit(expression.key);
        }

        this.visit(expression.value);

        return expression;
    }

    protected visitRestElement(expression: RestElement): INode
    {
        if (!TypeGuard.isIdentifier(expression.argument))
        {
            this.visit(expression.argument);
        }

        return expression;
    }

    protected visitTaggedTemplateExpression(expression: TaggedTemplateExpression): INode
    {
        this.rollback();

        this.visit(expression.callee);

        this.reset();

        this.visit(expression.quasi);

        return expression;
    }

    protected visitThisExpression(expression: ThisExpression): INode
    {
        this.stack.unshift("this");

        this.commit();

        return expression;
    }

    protected visitUpdateExpression(expression: UpdateExpression): INode
    {
        this.rollback();

        this.visit(expression.argument);

        return expression;
    }
}
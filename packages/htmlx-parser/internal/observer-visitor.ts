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

    public static observe(expression: INode): [string, ...string[]][]
    {
        const visitor = new ObserverVisitor();

        visitor.visit(expression);

        visitor.commit();

        return visitor.paths as [string, ...string[]][];
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

    protected override visitArrayPattern(expression: ArrayPattern): INode
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

    protected override visitArrowFunctionExpression(expression: ArrowFunctionExpression): INode
    {
        for (const parameter of expression.parameters)
        {
            if (!TypeGuard.isIdentifier(parameter))
            {
                this.visit(parameter);
            }
        }

        return expression;
    }

    protected override visitAssignmentExpression(expression: AssignmentExpression): INode
    {
        this.visit(expression.right);

        return expression;
    }

    protected override visitAssignmentPattern(expression: AssignmentPattern): INode
    {
        this.visit(expression.right);

        return expression;
    }

    protected override visitAssignmentProperty(expression: AssignmentProperty): INode
    {
        if (TypeGuard.isAssignmentPattern(expression.value))
        {
            this.visitAssignmentPattern(expression.value);
        }

        return expression;
    }

    protected override visitCallExpression(expression: CallExpression): INode
    {
        this.rollback();

        this.visit(expression.callee);

        this.reset();

        expression.arguments.forEach(this.visit.bind(this));

        return expression;
    }

    protected override visitLogicalExpression(expression: LogicalExpression): INode
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

    protected override visitConditionalExpression(expression: ConditionalExpression): INode
    {
        this.visit(expression.test);

        return expression;
    }

    protected override visitIdentifier(expression: Identifier): INode
    {
        if (expression.name != "undefined")
        {
            this.stack.unshift(expression.name);

            this.commit();
        }

        return expression;
    }

    protected override visitMemberExpression(expression: MemberExpression): INode
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

    protected override visitNewExpression(expression: NewExpression): INode
    {
        this.rollback();

        this.visit(expression.callee);

        this.reset();

        expression.arguments.forEach(this.visit.bind(this));

        return expression;
    }

    protected override visitParenthesizedExpression(expression: ParenthesizedExpression): INode
    {
        this.reset();

        this.visit(expression.argument);

        return expression;
    }

    protected override visitProperty(expression: Property): INode
    {
        if (expression.computed)
        {
            this.visit(expression.key);
        }

        this.visit(expression.value);

        return expression;
    }

    protected override visitRestElement(expression: RestElement): INode
    {
        if (!TypeGuard.isIdentifier(expression.argument))
        {
            this.visit(expression.argument);
        }

        return expression;
    }

    protected override visitTaggedTemplateExpression(expression: TaggedTemplateExpression): INode
    {
        this.rollback();

        this.visit(expression.callee);

        this.reset();

        this.visit(expression.quasi);

        return expression;
    }

    protected override visitThisExpression(expression: ThisExpression): INode
    {
        this.stack.unshift("this");

        this.commit();

        return expression;
    }

    protected override visitUpdateExpression(expression: UpdateExpression): INode
    {
        this.rollback();

        this.visit(expression.argument);

        return expression;
    }
}

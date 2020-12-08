import type
{
    IArrayPattern,
    IArrowFunctionExpression,
    IAssignmentExpression,
    IAssignmentPattern,
    IAssignmentProperty,
    ICallExpression,
    ICoalesceExpression,
    IConditionalExpression,
    IIdentifier,
    IMemberExpression,
    INewExpression,
    INode,
    IParenthesizedExpression,
    IProperty,
    IRestElement,
    ITaggedTemplateExpression,
    IThisExpression,
    IUpdateExpression,
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

    protected visitArrayPattern(expression: IArrayPattern): INode
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

    protected visitArrowFunctionExpression(expression: IArrowFunctionExpression): INode
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

    protected visitAssignmentExpression(expression: IAssignmentExpression): INode
    {
        this.visit(expression.right);

        return expression;
    }

    protected visitAssignmentPattern(expression: IAssignmentPattern): INode
    {
        this.visit(expression.right);

        return expression;
    }

    protected visitAssignmentProperty(expression: IAssignmentProperty): INode
    {
        if (TypeGuard.isAssignmentPattern(expression.value))
        {
            this.visitAssignmentPattern(expression.value);
        }

        return expression;
    }

    protected visitCallExpression(expression: ICallExpression): INode
    {
        this.rollback();

        this.visit(expression.callee);

        this.reset();

        expression.arguments.forEach(this.visit.bind(this));

        return expression;
    }

    protected visitCoalesceExpression(expression: ICoalesceExpression): INode
    {
        this.visit(expression.left);

        return expression;
    }

    protected visitConditionalExpression(expression: IConditionalExpression): INode
    {
        this.visit(expression.test);

        return expression;
    }

    protected visitIdentifier(expression: IIdentifier): INode
    {
        if (expression.name != "undefined")
        {
            this.stack.unshift(expression.name);

            this.commit();
        }

        return expression;
    }

    protected visitMemberExpression(expression: IMemberExpression): INode
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

    protected visitNewExpression(expression: INewExpression): INode
    {
        this.rollback();

        this.visit(expression.callee);

        this.reset();

        expression.arguments.forEach(this.visit.bind(this));

        return expression;
    }

    protected visitParenthesizedExpression(expression: IParenthesizedExpression): INode
    {
        this.reset();

        this.visit(expression.argument);

        return expression;
    }

    protected visitProperty(expression: IProperty): INode
    {
        if (expression.computed)
        {
            this.visit(expression.key);
        }

        this.visit(expression.value);

        return expression;
    }

    protected visitRestElement(expression: IRestElement): INode
    {
        if (!TypeGuard.isIdentifier(expression.argument))
        {
            this.visit(expression.argument);
        }

        return expression;
    }

    protected visitTaggedTemplateExpression(expression: ITaggedTemplateExpression): INode
    {
        this.rollback();

        this.visit(expression.callee);

        this.reset();

        this.visit(expression.quasi);

        return expression;
    }

    protected visitThisExpression(expression: IThisExpression): INode
    {
        this.stack.unshift("this");

        this.commit();

        return expression;
    }

    protected visitUpdateExpression(expression: IUpdateExpression): INode
    {
        this.rollback();

        this.visit(expression.argument);

        return expression;
    }
}
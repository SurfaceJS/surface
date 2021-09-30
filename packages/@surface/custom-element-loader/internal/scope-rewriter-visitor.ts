import type
{
    IArrayPattern,
    IArrowFunctionExpression,
    IAssignmentPattern,
    IAssignmentProperty,
    IExpression,
    IIdentifier,
    IMemberExpression,
    INode,
    IObjectExpression,
    IObjectPattern,
    IPattern,
    IProperty,
    IRestElement,
} from "@surface/expression";
import Expression, { ExpressionRewriterVisitor, TypeGuard } from "@surface/expression";

export default class ScopeRewriterVisitor extends ExpressionRewriterVisitor
{
    private readonly scopes: Map<number, Set<string>> = new Map();
    private scopeIndex: number = 0;

    public static rewrite(expression: IExpression): IExpression
    {
        return new ScopeRewriterVisitor().visit(expression) as IExpression;
    }

    private getScope(): Set<string> | undefined
    {
        return this.scopes.get(this.scopeIndex);
    }

    private createScope(): Set<string>
    {
        this.scopeIndex++;

        const scope = new Set<string>();

        this.scopes.set(this.scopeIndex, scope);

        return scope;
    }

    private deleteScope(): void
    {
        this.getScope()!.clear();

        this.scopes.delete(this.scopeIndex);

        this.scopeIndex--;
    }

    private hasInScope(name: string): boolean
    {
        for (const scope of this.scopes.values())
        {
            if (scope.has(name))
            {
                return true;
            }
        }

        return false;
    }

    protected override visitArrayPattern(node: IArrayPattern): INode
    {
        const scope = this.getScope()!;

        const elements: (IPattern | null)[] = [];

        for (const element of node.elements)
        {
            if (element)
            {
                if (TypeGuard.isIdentifier(element))
                {
                    scope.add(element.name);

                    elements.push(element);
                }
                else if (TypeGuard.isRestElement(element) && TypeGuard.isIdentifier(element.argument))
                {
                    scope.add(element.argument.name);

                    elements.push(element);
                }
                else
                {
                    elements.push(this.visit(element) as IPattern | null);
                }
            }
            else
            {
                elements.push(element);
            }
        }

        return Expression.arrayPattern(elements);
    }

    protected override visitArrowFunctionExpression(node: IArrowFunctionExpression): INode
    {
        const scope = this.createScope();

        const parameters: IPattern[] = [];

        for (const parameter of node.parameters)
        {
            if (TypeGuard.isIdentifier(parameter))
            {
                parameters.push(parameter);

                scope.add(parameter.name);
            }
            else if (TypeGuard.isRestElement(parameter) && TypeGuard.isIdentifier(parameter.argument))
            {
                parameters.push(parameter);

                scope.add(parameter.argument.name);
            }
            else
            {
                parameters.push(this.visit(parameter) as IPattern);
            }
        }

        const body = this.visit(node.body) as IExpression;

        this.deleteScope();

        return Expression.arrowFunction(parameters, body);
    }

    protected override visitAssignmentPattern(node: IAssignmentPattern): INode
    {
        const scope = this.getScope()!;

        if (TypeGuard.isIdentifier(node.left))
        {
            scope.add(node.left.name);

            return Expression.assignmentPattern(node.left, this.visit(node.right) as IExpression) as IPattern;
        }

        return this.visit(node);
    }

    protected override visitAssignmentProperty(node: IAssignmentProperty): INode
    {
        const scope = this.getScope()!;

        if (TypeGuard.isIdentifier(node.key))
        {
            if (node.shorthand)
            {
                scope.add(node.key.name);
            }
            else if (TypeGuard.isIdentifier(node.value))
            {
                scope.add(node.value.name);
            }

            return Expression.assignmentProperty(node.computed ? this.visit(node.key) as IExpression : node.key, this.visit(node.value) as IPattern, node.computed, node.shorthand);
        }

        return super.visitAssignmentProperty(node);
    }

    protected override visitIdentifier(node: IIdentifier): INode
    {
        if (node.name != "undefined" && !this.hasInScope(node.name))
        {
            return Expression.member(Expression.identifier("scope"), node, false, false);
        }

        return node;
    }

    protected override visitMemberExpression(node: IMemberExpression): INode
    {
        if (node.computed)
        {
            return super.visitMemberExpression(node);
        }

        const object = this.visit(node.object) as IExpression;
        const property = TypeGuard.isIdentifier(node.property) && !node.computed
            ? node.property
            : this.visit(node.property) as IExpression;

        return Expression.member(object, property, false, false);
    }

    protected override visitObjectExpression(node: IObjectExpression): INode
    {
        const scope = this.getScope();

        const properties: IProperty[] = [];

        for (const property of node.properties)
        {
            if (TypeGuard.isProperty(property) && TypeGuard.isIdentifier(property.key) && !property.computed)
            {
                properties.push(Expression.property(property.key, this.visit(property.shorthand ? property.key : property.value) as IExpression, false, property.shorthand && scope?.has(property.key.name)));
            }
            else
            {
                properties.push(this.visit(property) as IProperty);
            }
        }

        return Expression.object(properties);
    }

    protected override visitObjectPattern(node: IObjectPattern): INode
    {
        const scope = this.getScope()!;

        const properties: (IAssignmentProperty | IRestElement)[] = [];

        for (const property of node.properties)
        {
            if (TypeGuard.isRestElement(property) && TypeGuard.isIdentifier(property.argument))
            {
                scope.add(property.argument.name);

                properties.push(property);
            }
            else
            {
                properties.push(this.visit(property) as IAssignmentProperty | IRestElement);
            }
        }

        return Expression.objectPattern(properties);
    }
}
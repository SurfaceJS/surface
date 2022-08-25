import
{
    ArrayPattern,
    ArrowFunctionExpression,
    AssignmentPattern,
    AssignmentProperty,
    ExpressionRewriterVisitor,
    Identifier,
    MemberExpression,
    ObjectExpression,
    ObjectPattern,
    Property,
    TypeGuard,
} from "@surface/expression";
import type
{
    IExpression,
    INode,
    IPattern,
    RestElement,
} from "@surface/expression";

export default class ScopeRewriterVisitor extends ExpressionRewriterVisitor
{
    private readonly scopes: Map<number, Set<string>> = new Map();
    private scopeIndex: number = 0;

    private constructor(private readonly identifier: string = "scope")
    {
        super();
    }

    public static rewriteExpression(expression: IExpression): IExpression
    {
        return new ScopeRewriterVisitor().visit(expression) as IExpression;
    }

    public static rewritePattern(pattern: IPattern, identifier: string): IPattern
    {
        const visitor = new ScopeRewriterVisitor(identifier);

        visitor.createScope();

        const rewrittenPattern = visitor.visit(pattern) as IPattern;

        visitor.deleteScope();

        return rewrittenPattern;
    }

    public static collectScope(pattern: IPattern): ObjectExpression
    {
        return new ScopeRewriterVisitor().collectScope(pattern);
    }

    private getScope(): Set<string> | undefined
    {
        return this.scopes.get(this.scopeIndex);
    }

    private collectScope(pattern: IPattern): ObjectExpression
    {
        const scope = this.createScope();

        this.visit(pattern);

        const properties = Array.from(scope).map(x => new Property(new Identifier(x), new Identifier(x), false, true));

        this.deleteScope();

        return new ObjectExpression(properties);
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

    protected override visitArrayPattern(node: ArrayPattern): INode
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

        return new ArrayPattern(elements);
    }

    protected override visitArrowFunctionExpression(node: ArrowFunctionExpression): INode
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

        return new ArrowFunctionExpression(parameters, body);
    }

    protected override visitAssignmentPattern(node: AssignmentPattern): INode
    {
        const scope = this.getScope()!;

        if (TypeGuard.isIdentifier(node.left))
        {
            scope.add(node.left.name);

            return new AssignmentPattern(node.left, this.visit(node.right) as IExpression) as IPattern;
        }

        return this.visit(node);
    }

    protected override visitAssignmentProperty(node: AssignmentProperty): INode
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

            return new AssignmentProperty(node.computed ? this.visit(node.key) as IExpression : node.key, this.visit(node.value) as IPattern, node.computed, node.shorthand);
        }

        return super.visitAssignmentProperty(node);
    }

    protected override visitIdentifier(node: Identifier): INode
    {
        if (node.name != "undefined" && !this.hasInScope(node.name))
        {
            return new MemberExpression(new Identifier(this.identifier), node, false, false);
        }

        return node;
    }

    protected override visitMemberExpression(node: MemberExpression): INode
    {
        if (node.computed)
        {
            return super.visitMemberExpression(node);
        }

        const object = this.visit(node.object) as IExpression;
        const property = TypeGuard.isIdentifier(node.property) && !node.computed
            ? node.property
            : this.visit(node.property) as IExpression;

        return new MemberExpression(object, property, false, false);
    }

    protected override visitObjectExpression(node: ObjectExpression): INode
    {
        const scope = this.getScope();

        const properties: Property[] = [];

        for (const property of node.properties)
        {
            if (TypeGuard.isProperty(property) && TypeGuard.isIdentifier(property.key) && !property.computed)
            {
                properties.push(new Property(property.key, this.visit(property.shorthand ? property.key : property.value) as IExpression, false, property.shorthand && scope?.has(property.key.name)));
            }
            else
            {
                properties.push(this.visit(property) as Property);
            }
        }

        return new ObjectExpression(properties);
    }

    protected override visitObjectPattern(node: ObjectPattern): INode
    {
        const scope = this.getScope()!;

        const properties: (AssignmentProperty | RestElement)[] = [];

        for (const property of node.properties)
        {
            if (TypeGuard.isRestElement(property) && TypeGuard.isIdentifier(property.argument))
            {
                scope.add(property.argument.name);

                properties.push(property);
            }
            else
            {
                properties.push(this.visit(property) as AssignmentProperty | RestElement);
            }
        }

        return new ObjectPattern(properties);
    }
}

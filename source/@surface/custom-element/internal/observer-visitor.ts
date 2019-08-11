import { Indexer }              from "@surface/core";
import ExpressionVisitor        from "@surface/expression/expression-visitor";
import IArrayPattern            from "@surface/expression/interfaces/array-pattern";
import IArrowFunctionExpression from "@surface/expression/interfaces/arrow-function-expression";
import IAssignmentExpression    from "@surface/expression/interfaces/assignment-expression";
import IAssignmentPattern       from "@surface/expression/interfaces/assignment-pattern";
import IAssignmentProperty      from "@surface/expression/interfaces/assignment-property";
import ICallExpression          from "@surface/expression/interfaces/call-expression";
import IExpression              from "@surface/expression/interfaces/expression";
import IIdentifier              from "@surface/expression/interfaces/identifier";
import IMemberExpression        from "@surface/expression/interfaces/member-expression";
import INewExpression           from "@surface/expression/interfaces/new-expression";
import INode                    from "@surface/expression/interfaces/node";
import IProperty                from "@surface/expression/interfaces/property";
import IThisExpression          from "@surface/expression/interfaces/this-expression";
import TypeGuard                from "@surface/expression/internal/type-guard";
import NodeType                 from "@surface/expression/node-type";
import Reactive                 from "@surface/reactive";
import IListener                from "@surface/reactive/interfaces/listener";
import ISubscription            from "@surface/reactive/interfaces/subscription";

export default class ObserverVisitor extends ExpressionVisitor
{
    private readonly scope: Indexer;
    private readonly paths: Array<string> = [];
    private stack: Array<string> = [];

    private constructor(scope: Indexer)
    {
        super();

        this.scope = scope;
    }

    public static observe(expression: IExpression, scope: Indexer, listener: IListener): ISubscription
    {
        const visitor       = new ObserverVisitor(scope);
        const subscriptions = [] as Array<ISubscription>;

        visitor.visit(expression);

        visitor.store();

        for (const path of visitor.paths)
        {
            subscriptions.push(Reactive.observe(scope, path, listener)[2]);
        }

        return { unsubscribe: () => subscriptions.forEach(x => x.unsubscribe()) } ;
    }

    private store(): void
    {
        if (this.stack.length > 0)
        {
            this.paths.push(this.stack.join("."));
            this.stack = [];
        }
    }

    protected visitArrayPattern(expression: IArrayPattern): INode
    {
        for (const element of expression.elements)
        {
            if (element && !TypeGuard.isIdentifier(element))
            {
                super.visit(element);
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
                super.visit(paramenter);
            }
        }

        this.visit(expression.body);

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
        expression.arguments.forEach(this.visit);

        return expression;
    }

    protected visitIdentifier(expression: IIdentifier): INode
    {
        if (expression.name != "undefined")
        {
            this.stack.unshift(expression.name);

            this.store();
        }

        return expression;
    }

    protected visitMemberExpression(expression: IMemberExpression): INode
    {
        if (expression.property.type == NodeType.Identifier || expression.property.type == NodeType.Literal)
        {
            const key = TypeGuard.isIdentifier(expression.property) && !expression.computed ? expression.property.name : expression.property.evaluate(this.scope, true) as string;

            this.stack.unshift(key);
        }

        this.visit(expression.object);

        return expression;
    }

    protected visitNewExpression(expression: INewExpression): INode
    {
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

    protected visitThisExpression(expression: IThisExpression): INode
    {
        this.stack.unshift("this");

        this.store();

        return expression;
    }
}
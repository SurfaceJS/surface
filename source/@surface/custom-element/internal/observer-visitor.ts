import { Indexer }               from "@surface/core";
import ExpressionVisitor         from "@surface/expression/expression-visitor";
import IArrayPattern             from "@surface/expression/interfaces/array-pattern";
import IArrowFunctionExpression  from "@surface/expression/interfaces/arrow-function-expression";
import IAssignmentExpression     from "@surface/expression/interfaces/assignment-expression";
import IAssignmentPattern        from "@surface/expression/interfaces/assignment-pattern";
import IAssignmentProperty       from "@surface/expression/interfaces/assignment-property";
import ICallExpression           from "@surface/expression/interfaces/call-expression";
import ICoalesceExpression       from "@surface/expression/interfaces/coalesce-expression";
import IConditionalExpression    from "@surface/expression/interfaces/conditional-expression";
import IExpression               from "@surface/expression/interfaces/expression";
import IIdentifier               from "@surface/expression/interfaces/identifier";
import IMemberExpression         from "@surface/expression/interfaces/member-expression";
import INewExpression            from "@surface/expression/interfaces/new-expression";
import INode                     from "@surface/expression/interfaces/node";
import IParenthesizedExpression  from "@surface/expression/interfaces/parenthesized-expression";
import IProperty                 from "@surface/expression/interfaces/property";
import IRestElement              from "@surface/expression/interfaces/rest-element";
import ITaggedTemplateExpression from "@surface/expression/interfaces/tagged-template-expression";
import IThisExpression           from "@surface/expression/interfaces/this-expression";
import IUpdateExpression         from "@surface/expression/interfaces/update-expression";
import TypeGuard                 from "@surface/expression/internal/type-guard";
import NodeType                  from "@surface/expression/node-type";
import IListener                 from "@surface/reactive/interfaces/listener";
import ISubscription             from "@surface/reactive/interfaces/subscription";
import DataBind                  from "./data-bind";

export default class ObserverVisitor extends ExpressionVisitor
{
    private readonly scope: Indexer;

    private readonly cache: Map<IExpression, unknown> = new Map();

    private readonly paths: Array<Array<string>> = [];

    private brokenPath: boolean       = false;
    private stack:      Array<string> = [];

    private constructor(scope: Indexer)
    {
        super();

        this.scope = scope;
    }

    public static observe(expression: IExpression, scope: Indexer, listener: IListener, lazy: boolean): ISubscription
    {
        const visitor       = new ObserverVisitor(scope);
        const subscriptions = [] as Array<ISubscription>;

        visitor.visit(expression);

        visitor.commit();

        for (const path of visitor.paths)
        {
            if (path.length > 1)
            {
                subscriptions.push(DataBind.oneWay(scope, path, listener, lazy)[1]);
            }
        }

        return { unsubscribe: () => subscriptions.forEach(x => x.unsubscribe()) } ;
    }

    private commit(): void
    {
        if (this.stack.length > 0)
        {
            this.paths.push([...this.stack]);
            this.stack = [];
        }
    }

    private evaluate(expression: IExpression): unknown
    {
        if (this.cache.has(expression))
        {
            return this.cache.get(expression);
        }
        else
        {
            const value = expression.evaluate(this.scope);

            this.cache.set(expression, value);

            return value;
        }
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

        return expression;
    }

    protected visitAssignmentExpression(expression: IAssignmentExpression): INode
    {
        super.visit(expression.right);

        return expression;
    }

    protected visitAssignmentPattern(expression: IAssignmentPattern): INode
    {
        super.visit(expression.right);

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

        super.visit(expression.callee);

        this.reset();

        expression.arguments.forEach(super.visit.bind(this));

        return expression;
    }

    protected visitCoalesceExpression(expression: ICoalesceExpression): INode
    {
        super.visit(expression.left);

        return expression;
    }

    protected visitConditionalExpression(expression: IConditionalExpression): INode
    {
        super.visit(expression.test);

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
        if (expression.optional)
        {
            this.rollback();
        }
        else if (expression.property.type == NodeType.Identifier || expression.property.type == NodeType.Literal)
        {
            const key = TypeGuard.isIdentifier(expression.property) && !expression.computed ? expression.property.name : `${this.evaluate(expression.property)}`;

            if (!this.brokenPath)
            {
                this.stack.unshift(key);
            }
        }
        else
        {
            super.visit(expression.property);
        }

        super.visit(expression.object);

        return expression;
    }

    protected visitNewExpression(expression: INewExpression): INode
    {
        this.rollback();

        super.visit(expression.callee);

        this.reset();

        expression.arguments.forEach(super.visit.bind(this));

        return expression;
    }

    protected visitParenthesizedExpression(expression: IParenthesizedExpression): INode
    {
        this.reset();

        super.visit(expression.argument);

        return expression;
    }

    protected visitProperty(expression: IProperty): INode
    {
        if (expression.computed)
        {
            super.visit(expression.key);
        }

        super.visit(expression.value);

        return expression;
    }

    protected visitRestElement(expression: IRestElement): INode
    {
        if (!TypeGuard.isIdentifier(expression.argument))
        {
            super.visit(expression.argument);
        }

        return expression;
    }

    protected visitTaggedTemplateExpression(expression: ITaggedTemplateExpression): INode
    {
        this.rollback();

        super.visit(expression.callee);

        this.reset();

        super.visit(expression.quasi);

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

        super.visit(expression.argument);

        return expression;
    }
}
import { Indexer, Nullable } from "@surface/core";
import { typeGuard }         from "@surface/core/common/generic";
import ExpressionVisitor     from "@surface/expression/expression-visitor";
import IIdentifier           from "@surface/expression/interfaces/identifier";
import INode                 from "@surface/expression/interfaces/node";
import NodeType              from "@surface/expression/node-type";
import IExpression           from "../../expression/interfaces/expression";
import IMemberExpression     from "../../expression/interfaces/member-expression";
import IListener             from "../interfaces/listener";
import IReactor              from "../interfaces/reactor";
import ISubscription         from "../interfaces/subscription";
import Observer              from "./observer";
import Reactor               from "./reactor";

export default class ReactiveVisitor extends ExpressionVisitor
{
    protected dependency:    Nullable<IReactor>   = null;
    protected subscriptions: Array<ISubscription> = [];

    public constructor(protected readonly listener: IListener, protected readonly scope: Indexer)
    {
        super();
    }

    protected reactivate(target: Indexer, key: string): IReactor
    {
        const reactor = Reactor.makeReactive(target, key);

        if (!this.dependency)
        {
            const observer = reactor.getObserver(key) || new Observer();

            this.subscriptions.push(observer.subscribe(this.listener));

            reactor.setObserver(key, observer);
        }
        else
        {
            reactor.setDependency(key, this.dependency);
        }

        return reactor;
    }

    protected visitIdentifier(expression: IIdentifier): INode
    {
        this.reactivate(this.scope, expression.name);

        this.dependency = null;

        return super.visitIdentifier(expression);
    }

    protected visitMemberExpression(expression: IMemberExpression): INode
    {
        if (expression.property.type == NodeType.Identifier || expression.property.type == NodeType.Literal)
        {
            const target = expression.object.evaluate(this.scope, true);
            const key    = expression.property.evaluate(this.scope, true);

            if (typeGuard<Indexer>(target, x => x instanceof Object))
            {
                this.dependency = this.reactivate(target, `${key}`);
            }
            else
            {
                throw new Error("Can\'t make reactive a non initialized target");
            }
        }

        this.visit(expression.object);

        return expression;
    }

    protected visit(expression: IExpression): INode
    {
        if (expression.type != NodeType.Identifier && expression.type != NodeType.MemberExpression)
        {
            this.dependency = null;
        }

        return super.visit(expression);
    }

    public observe(expression: IExpression): ISubscription
    {
        this.subscriptions = [];

        this.visit(expression);

        return { unsubscribe: () => this.subscriptions.forEach(x => x.unsubscribe()) } ;
    }
}
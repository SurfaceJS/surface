import { Action1 } from "@surface/core";
import IDisposable from "@surface/core/interfaces/disposable";
import IExpression from "@surface/expression/interfaces/expression";
import NodeType    from "@surface/expression/node-type";
import { Scope }   from "../../types";

export default class EventDirectiveHandler implements IDisposable
{
    private readonly action: Action1<Event>;

    protected readonly element:    Element;
    protected readonly expression: IExpression;
    protected readonly name:       string;
    protected readonly scope:      Scope;

    public constructor(scope: Scope, element: Element, key: IExpression, expression: IExpression)
    {
        this.scope      = scope;
        this.element    = element;
        this.expression = expression;

        this.name = `${key.evaluate(scope)}`;

        this.action = expression.type == NodeType.ArrowFunctionExpression || expression.type == NodeType.Identifier || expression.type == NodeType.MemberExpression
            ? expression.evaluate(scope) as Action1<Event>
            : () => expression.evaluate(scope);

        this.element.addEventListener(this.name, this.action);
    }

    public dispose(): void
    {
        this.element.removeEventListener(this.name, this.action);
    }
}
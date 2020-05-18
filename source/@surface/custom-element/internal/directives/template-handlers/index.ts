import { AsyncAction, IDisposable } from "@surface/core";
import { enumerateRange }           from "../../common";
import ITemplateDescriptor          from "../../interfaces/template-descriptor";
import Metadata                     from "../../metadata/metadata";
import TemplateProcessor            from "../../template-processor";
import { Scope }                    from "../../types";

export default abstract class TemplateDirectiveHandler implements IDisposable
{
    protected readonly context: Node;
    protected readonly host:    Node;
    protected readonly scope:   Scope;

    protected constructor(scope: Scope, context: Node, host: Node)
    {
        this.scope   = scope;
        this.context = context;
        this.host    = host;
    }

    protected async fireAsync(action: AsyncAction): Promise<void>
    {
        await action();
    }

    protected processTemplate(scope: Scope, context: Node, host: Node, template: HTMLTemplateElement, descriptor: ITemplateDescriptor): [Element, IDisposable]
    {
        const root = template.content.cloneNode(true) as Element;

        const disposable = TemplateProcessor.process({ scope, context, host, root, descriptor });

        return [root, disposable];
    }

    protected removeInRange(start: ChildNode, end: ChildNode): void
    {
        for (const element of enumerateRange(start, end))
        {
            Metadata.of(element)?.disposables.forEach(x => x.dispose());

            element.remove();
        }
    }

    public abstract dispose(): void;
}
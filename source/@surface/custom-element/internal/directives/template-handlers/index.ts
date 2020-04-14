import { AsyncAction }     from "@surface/core";
import IDisposable         from "@surface/core/interfaces/disposable";
import { enumerateRange }  from "../../common";
import ITemplateDescriptor from "../../interfaces/template-descriptor";
import TemplateMetadata    from "../../metadata/template-metadata";
import TemplateProcessor   from "../../template-processor";
import { Scope }           from "../../types";

export default abstract class TemplateDirectiveHandler implements IDisposable
{
    protected readonly host:  Node;
    protected readonly scope: Scope;

    protected constructor(scope: Scope, host: Node)
    {
        this.scope = scope;
        this.host  = host;
    }

    protected async fireAsync(action: AsyncAction): Promise<void>
    {
        await action();
    }

    protected processTemplate(scope: Scope, host: Node, template: HTMLTemplateElement, descriptor: ITemplateDescriptor, metadata: TemplateMetadata): [Element, IDisposable]
    {
        const root = template.content.cloneNode(true) as Element;

        root.normalize();

        TemplateMetadata.set(root, metadata);

        const disposable = TemplateProcessor.process(scope, host, root, descriptor);

        return [root, disposable];
    }

    protected removeInRange(start: ChildNode, end: ChildNode): void
    {
        for (const element of enumerateRange(start, end))
        {
            element.remove();
        }
    }

    public abstract dispose(): void;
}
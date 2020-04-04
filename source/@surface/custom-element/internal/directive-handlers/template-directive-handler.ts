import { AsyncAction }     from "@surface/core";
import IDisposable         from "@surface/core/interfaces/disposable";
import { enumerateRange }  from "../common";
import ITemplateDescriptor from "../interfaces/template-descriptor";
import TemplateMetadata    from "../metadata/template-metadata";
import TemplateProcessor   from "../template-processor";
import { Scope }           from "../types";

export default abstract class TemplateDirectiveHandler implements IDisposable
{
    protected async fireAsync(action: AsyncAction): Promise<void>
    {
        await action();
    }

    protected processTemplate(scope: Scope, host: Node, template: HTMLTemplateElement, descriptor: ITemplateDescriptor, metadata: TemplateMetadata): [Element, IDisposable]
    {
        const content = template.content.cloneNode(true) as Element;

        content.normalize();

        TemplateMetadata.set(content, metadata);

        const disposable = TemplateProcessor.process(scope, host, content, descriptor);

        return [content, disposable];
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
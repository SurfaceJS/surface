import { IDisposable }     from "@surface/core";
import ITemplateDescriptor from "../../interfaces/template-descriptor";
import TemplateProcessor   from "../../processors/template-processor";

export default abstract class TemplateDirectiveHandler implements IDisposable
{
    protected readonly context: Node;
    protected readonly host:    Node;
    protected readonly scope:   object;

    protected constructor(scope: object, context: Node, host: Node)
    {
        this.scope   = scope;
        this.context = context;
        this.host    = host;
    }

    protected processTemplate(scope: object, context: Node, host: Node, template: HTMLTemplateElement, descriptor: ITemplateDescriptor): [Element, IDisposable]
    {
        const root = template.content.cloneNode(true) as Element;

        const disposable = TemplateProcessor.process({ context, descriptor, host, root, scope });

        return [root, disposable];
    }

    public abstract dispose(): void;
}
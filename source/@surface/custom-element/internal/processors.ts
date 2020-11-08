import { IDisposable }     from "@surface/core";
import ChangeTracker from "./change-tracker";
import ITemplateDescriptor from "./interfaces/template-descriptor";
import ParallelWorker      from "./parallel-worker";
import TemplateParser      from "./template-parser";
import TemplateProcessor   from "./template-processor";

const cache = new Map<string, [template: HTMLTemplateElement, descriptor: ITemplateDescriptor]>();

export function processTemplate(template: string, scope: object): [content: DocumentFragment, disposable: IDisposable]
{
    if (!cache.has(template))
    {
        const templateElement = document.createElement("template");

        templateElement.innerHTML = template;

        cache.set(template, TemplateParser.parse("annonymous", template));
    }

    const [parsed, descriptor] = cache.get(template)!;
    const content              = parsed.content;

    const disposable = TemplateProcessor.process({ descriptor, host: content, root: content, scope });

    return [content, disposable];
}

export async function whenDone(): Promise<void>
{
    return ParallelWorker.whenDone().finally(async () => ChangeTracker.instance.nextTick());
}
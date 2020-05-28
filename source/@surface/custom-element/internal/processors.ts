import { IDisposable }     from "@surface/core";
import ITemplateDescriptor from "./interfaces/descriptors/template-descriptor";
import ParallelWorker      from "./parallel-worker";
import TemplateParser      from "./template-parser";
import TemplateProcessor   from "./template-processor";
import { Scope }           from "./types";

const cache = new Map<string, [HTMLTemplateElement, ITemplateDescriptor]>();

export function processTemplate(template: string, scope: Scope): [DocumentFragment, IDisposable]
{
    if (!cache.has(template))
    {
        let templateElement = document.createElement("template");

        templateElement.innerHTML = template;

        cache.set(template, TemplateParser.parse("annonymous", template));
    }

    const [parsed, descriptor] = cache.get(template)!;
    const content              = parsed.content;

    const disposable = TemplateProcessor.process({ scope: scope, host: content, root: content, descriptor });

    return [content, disposable];
}

export async function renderDone(): Promise<void>
{
    await ParallelWorker.done();
}

export async function timeout(): Promise<void>
{
    await new Promise(x => setTimeout(x, 0));
}
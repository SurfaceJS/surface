import type { IDisposable }          from "@surface/core";
import TemplateParser                from "../parsers/template-parser.js";
import { globalCustomDirectives }    from "../singletons.js";
import type { DirectiveEntry }       from "../types/index.js";
import type TemplateDescriptor       from "../types/template-descriptor";
import type TemplateProcessorContext from "../types/template-processor-context.js";
import TemplateProcessor             from "./template-processor.js";

const cache = new Map<string, [template: HTMLTemplateElement, descriptor: TemplateDescriptor]>();

export default function processTemplate(template: string, scope: object, directiveHandlers?: Record<string, DirectiveEntry>): [content: DocumentFragment, disposable: IDisposable]
{
    if (!cache.has(template))
    {
        const templateElement = document.createElement("template");

        templateElement.innerHTML = template;

        cache.set(template, TemplateParser.parse("annonymous", template));
    }

    const [parsed, descriptor] = cache.get(template)!;
    const content              = parsed.content;

    const context: TemplateProcessorContext =
    {
        customDirectives:   new Map([...globalCustomDirectives, ...Object.entries(directiveHandlers ?? { })]),
        host:               content,
        root:               content,
        scope,
        templateDescriptor: descriptor,
    };

    const disposable = TemplateProcessor.process(context);

    return [content, disposable];
}
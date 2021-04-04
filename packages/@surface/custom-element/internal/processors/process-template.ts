import type { IDisposable }           from "@surface/core";
import type ITemplateDescriptor       from "../interfaces/template-descriptor";
import TemplateParser                 from "../parsers/template-parser.js";
import { globalCustomDirectives }     from "../singletons.js";
import type { DirectiveHandlerEntry } from "../types/index.js";
import type TemplateProcessorContext  from "../types/template-processor-context.js";
import TemplateProcessor              from "./template-processor.js";

const cache = new Map<string, [template: HTMLTemplateElement, descriptor: ITemplateDescriptor]>();

export default function processTemplate(template: string, scope: object, directiveHandlers?: Record<string, DirectiveHandlerEntry>): [content: DocumentFragment, disposable: IDisposable]
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
        customDirectives: new Map([...globalCustomDirectives, ...Object.entries(directiveHandlers ?? { })]),
        descriptor,
        host:             content,
        root:             content,
        scope,
    };

    const disposable = TemplateProcessor.process(context);

    return [content, disposable];
}
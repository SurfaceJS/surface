import type { IDisposable }          from "@surface/core";
import TemplateParser                from "../parsers/template-parser.js";
import { globalCustomDirectives }    from "../singletons.js";
import type { DirectiveEntry }       from "../types/index.js";
import type TemplateDescriptor       from "../types/template-descriptor";
import type TemplateProcessorContext from "../types/template-processor-context.js";
import TemplateProcessor             from "./template-processor.js";

const cache = new Map<string | HTMLTemplateElement, [template: HTMLTemplateElement, descriptor: TemplateDescriptor]>();

export default function processTemplate(template: string | HTMLTemplateElement, scope: object, directives?: Record<string, DirectiveEntry>): [content: DocumentFragment, disposable: IDisposable]
{
    if (!cache.has(template))
    {
        if (typeof template == "string")
        {
            const templateElement = document.createElement("template");

            templateElement.innerHTML = template;

            cache.set(template, TemplateParser.parse("annonymous", template));
        }
        else
        {
            const templateElement = template.cloneNode(true) as HTMLTemplateElement;

            cache.set(template, [templateElement, TemplateParser.parseReference("annonymous", templateElement)]);
        }
    }

    const [parsed, descriptor] = cache.get(template)!;
    const content              = parsed.content;

    const context: TemplateProcessorContext =
    {
        directives:         new Map([...globalCustomDirectives, ...Object.entries(directives ?? { })]),
        host:               content,
        root:               content,
        scope,
        templateDescriptor: descriptor,
    };

    const disposable = TemplateProcessor.process(context);

    return [content, disposable];
}
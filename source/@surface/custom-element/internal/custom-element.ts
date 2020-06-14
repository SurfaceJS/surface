import { Action, Constructor }         from "@surface/core";
import directiveRegistry               from "./directive-registry";
import ICustomElement                  from "./interfaces/custom-element";
import StaticMetadata                  from "./metadata/static-metadata";
import { STATIC_METADATA }             from "./symbols";
import { DirectiveHandlerConstructor } from "./types";

export const templateable = <TConstructor extends Constructor<HTMLElement>>(base: TConstructor) =>
{
    abstract class Templateable extends base
    {
        public shadowRoot!: ShadowRoot;

        public onAfterBind?: Action;

        // tslint:disable-next-line:no-any
        public constructor(...args: Array<any>)
        {
            super(...args);

            this.attachShadow({ mode: "open" });

            const metadata = (this.constructor as Function & { [STATIC_METADATA]?: StaticMetadata })[STATIC_METADATA];

            if (metadata?.styles)
            {
                (this.shadowRoot as { adoptedStyleSheets?: Array<CSSStyleSheet> }).adoptedStyleSheets = metadata.styles;
            }

            if (metadata?.template)
            {
                const content = document.importNode(metadata.template.content, true);

                content.normalize();

                this.shadowRoot.appendChild(content);
            }
        }

        public static registerDirective<T extends DirectiveHandlerConstructor>(name: string, handlerConstructor: T): void
        {
            directiveRegistry.set(name, handlerConstructor);
        }
    }
    return Templateable;
};

// tslint:disable-next-line:variable-name
export default class CustomElement extends templateable(HTMLElement) implements ICustomElement
{ }
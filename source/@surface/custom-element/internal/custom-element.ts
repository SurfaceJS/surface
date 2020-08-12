import { Constructor }              from "@surface/core";
import directiveRegistry            from "./directive-registry";
import ICustomElement               from "./interfaces/custom-element";
import StaticMetadata               from "./metadata/static-metadata";
import { TEMPLATEABLE }             from "./symbols";
import { DirectiveHandlerRegistry } from "./types";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const templateable = <TConstructor extends Constructor<HTMLElement>>(base: TConstructor) =>
{
    abstract class Templateable extends base implements ICustomElement
    {
        public static readonly [TEMPLATEABLE]: boolean = true;

        public shadowRoot!: ShadowRoot;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public constructor(...args: any[])
        {
            super(...args);

            this.attachShadow({ mode: "open" });

            const metadata = StaticMetadata.from(this.constructor);

            if (metadata?.styles)
            {
                (this.shadowRoot as { adoptedStyleSheets?: CSSStyleSheet[] }).adoptedStyleSheets = metadata.styles;
            }

            if (metadata?.template)
            {
                const content = metadata.template.content.cloneNode(true);

                this.shadowRoot.appendChild(content);
            }
        }
    }
    return Templateable;
};

export default class CustomElement extends templateable(HTMLElement)
{
    public static registerDirective<T extends DirectiveHandlerRegistry>(name: string, handlerConstructor: T): void
    {
        directiveRegistry.set(name, handlerConstructor);
    }
}
import { Action, Constructor }         from "@surface/core";
import ICustomElement                  from "./interfaces/custom-element";
import directiveRegistry               from "./internal/directive-registry";
import StaticMetadata                  from "./internal/metadata/static-metadata";
import References                      from "./internal/references";
import { STATIC_METADATA }             from "./internal/symbols";
import { DirectiveHandlerConstructor } from "./internal/types";

export const templateable = <TConstructor extends Constructor<HTMLElement>>(base: TConstructor) =>
{
    abstract class Templateable extends base
    {
        private readonly _references: References;

        public get references(): References
        {
            return this._references;
        }

        public shadowRoot!: ShadowRoot;

        public onAfterBind?: Action;

        // tslint:disable-next-line:no-any
        public constructor(...args: Array<any>)
        {
            super(...args);

            this.attachShadow({ mode: "open" });

            this.applyMetadata(this.shadowRoot);

            this._references = new References(this.shadowRoot);
        }

        public static registerDirective<T extends DirectiveHandlerConstructor>(name: string, handlerConstructor: T): void
        {
            directiveRegistry.set(name, handlerConstructor);
        }

        private applyMetadata(shadowRoot: ShadowRoot): void
        {
            const metadata = (this.constructor as Function & { [STATIC_METADATA]?: StaticMetadata })[STATIC_METADATA];

            if (metadata?.styles)
            {
                // (shadowRoot as { adoptedStyleSheets?: Array<CSSStyleSheet> }).adoptedStyleSheets = metadata.styles;
            }

            if (metadata?.template)
            {
                const content = document.importNode(metadata.template.content, true);

                content.normalize();

                shadowRoot.appendChild(content);
            }
        }
    }
    return Templateable;
};

// tslint:disable-next-line:variable-name

export default class CustomElement extends templateable(HTMLElement) implements ICustomElement
{ }

// export default class CustomElement extends HTMLElement implements ICustomElement
// {
//     private readonly _references: References;

//     public get references(): References
//     {
//         return this._references;
//     }

//     public shadowRoot!: ShadowRoot;

//     public onAfterBind?: Action;

//     public constructor()
//     {
//         super();

//         this.attachShadow({ mode: "open" });

//         this.applyMetadata(this.shadowRoot);

//         this._references = new References(this.shadowRoot);
//     }

//     public static registerDirective<T extends DirectiveHandlerConstructor>(name: string, handlerConstructor: T): void
//     {
//         directiveRegistry.set(name, handlerConstructor);
//     }

//     private applyMetadata(shadowRoot: ShadowRoot): void
//     {
//         const metadata = (this.constructor as Function & { [STATIC_METADATA]?: StaticMetadata })[STATIC_METADATA];

//         if (metadata?.styles)
//         {
//             // (shadowRoot as { adoptedStyleSheets?: Array<CSSStyleSheet> }).adoptedStyleSheets = metadata.styles;
//         }

//         if (metadata?.template)
//         {
//             const content = document.importNode(metadata.template.content, true);

//             content.normalize();

//             shadowRoot.appendChild(content);
//         }
//     }
// }
import { JSDOM } from "jsdom";

const registries = new Map<string, Function>();

const window = new JSDOM().window;
Object.assign
(
    window,
    {
        customElements:
        {
            define(name: string, constructor: Function, _options?: ElementDefinitionOptions)
            {
                registries.set(name, constructor);
            },
            get(name: string)
            {
                return registries.get(name);
            },
            upgrade(_root: Node)
            {
                return;
            },
            async whenDefined(_name: string)
            {
                return await new Promise(resolve => setTimeout(resolve, 0));
            }
        } as CustomElementRegistry,
        requestAnimationFrame(callback: FrameRequestCallback)
        {
            setTimeout(callback, 0);
        }
    }
);

function ProxyHTMLElement() { return; }

ProxyHTMLElement.prototype = window.HTMLElement.prototype;

ProxyHTMLElement.prototype.attachShadow = () => window.document.createElement("div") as unknown as ShadowRoot;

(window.HTMLElement as Object) = ProxyHTMLElement;

Object.assign
(
    global,
    {
        document:         window.document,
        navigator:        window.navigator,
        location:         window.location,
        window:           window,
        DOMTokenList:     window.DOMTokenList,
        Event:            window.Event,
        HTMLElement:      window.HTMLElement,
        HTMLInputElement: window.HTMLInputElement,
        NamedNodeMap:     window.NamedNodeMap,
        Node:             window.Node,
        NodeList:         window.NodeList,
        Window:           window.constructor,
        __registries__:   registries
    }
);
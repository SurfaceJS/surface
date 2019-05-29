import { JSDOM } from "jsdom";

const window = new JSDOM().window;
Object.assign
(
    window,
    {
        customElements: { define: () => { return; } }
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
    }
);
import { JSDOM } from "jsdom";

const window = new JSDOM().window;
Object.assign
(
    window,
    {
        customElements: { define: () => { return; } }
    }
);

// tslint:disable-next-line:no-empty
function ProxyHTMLElement() { }

ProxyHTMLElement.prototype = window.HTMLElement.prototype;

let shadowRoot: HTMLElement|null = null;
ProxyHTMLElement.prototype["attachShadow"] = () => shadowRoot || (shadowRoot = window.document.createElement("div"));

(window.HTMLElement as Object) = ProxyHTMLElement;

Object.assign
(
    global,
    {
        DOMTokenList:  window.DOMTokenList,
        Window:        window.constructor,
        window:        window,
        HTMLElement:   window.HTMLElement,
        Node:          window.Node,
        document:      window.document,
        navigator:     window.navigator,
        location:      window.location,
        NodeList:      window.NodeList,
        NamedNodeMap:  window.NamedNodeMap,
        Event:         window.Event
    }
);
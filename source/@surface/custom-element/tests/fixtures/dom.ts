import { JSDOM }   from "jsdom";

const window = new JSDOM().window;

Object.assign
(
    global,
    {
        CSSStyleSheet:         class CSSStyleSheet { public replaceSync(): void { return; } },
        document:              window.document,
        DOMTokenList:          window.DOMTokenList,
        Event:                 window.Event,
        HTMLDivElement:        window.HTMLDivElement,
        HTMLElement:           window.HTMLElement,
        HTMLInputElement:      window.HTMLInputElement,
        location:              window.location,
        NamedNodeMap:          window.NamedNodeMap,
        navigator:             window.navigator,
        Node:                  window.Node,
        NodeList:              window.NodeList,
        requestAnimationFrame: window.requestAnimationFrame,
        window:                window,
        Window:                window.constructor,
    }
);
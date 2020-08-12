import { JSDOM } from "jsdom";

const jsdom = new JSDOM();

jsdom.reconfigure({ url: "http://localhost.com" });

const window = jsdom.window;

const windows = [window];

window.open = url =>
{
    const jsdom = new JSDOM();

    jsdom.reconfigure({ url: `http://localhost.com${url}` });

    windows.push(jsdom.window);

    return jsdom.window as object as Window;
};

Object.assign
(
    global,
    {
        CSSStyleSheet:         class CSSStyleSheet { public replaceSync(): void { /* */ } },
        DOMTokenList:          window.DOMTokenList,
        Event:                 window.Event,
        HTMLAnchorElement:     window.HTMLAnchorElement,
        HTMLDivElement:        window.HTMLDivElement,
        HTMLElement:           window.HTMLElement,
        HTMLInputElement:      window.HTMLInputElement,
        MouseEvent:            window.MouseEvent,
        NamedNodeMap:          window.NamedNodeMap,
        Node:                  window.Node,
        NodeList:              window.NodeList,
        Window:                window.constructor,
        document:              window.document,
        location:              window.location,
        navigator:             window.navigator,
        requestAnimationFrame: window.requestAnimationFrame,
        window,
        windows,
    },
);
import { DOMWindow, JSDOM } from "jsdom";

const jsdom = new JSDOM();

jsdom.reconfigure({ url: "http://localhost.com" });

const window = jsdom.window;

const windows = [window];

window.open = url =>
{
    const jsdom = new JSDOM();

    jsdom.reconfigure({ url });

    windows.push(jsdom.window);

    return jsdom.window as object as Window;
};

Object.assign
(
    global,
    {
        CSSStyleSheet:         class CSSStyleSheet { public replaceSync(): void { return; } },
        document:              window.document,
        DOMTokenList:          window.DOMTokenList,
        Event:                 window.Event,
        HTMLAnchorElement:     window.HTMLAnchorElement,
        HTMLDivElement:        window.HTMLDivElement,
        HTMLElement:           window.HTMLElement,
        HTMLInputElement:      window.HTMLInputElement,
        location:              window.location,
        MouseEvent:            window.MouseEvent,
        NamedNodeMap:          window.NamedNodeMap,
        navigator:             window.navigator,
        Node:                  window.Node,
        NodeList:              window.NodeList,
        requestAnimationFrame: window.requestAnimationFrame,
        window:                window,
        Window:                window.constructor,
        windows,
    }
);

declare global
{
    const windows: Array<DOMWindow>;
}
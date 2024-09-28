import crypto    from "crypto";
import { JSDOM } from "jsdom";

const instance = new JSDOM();

instance.reconfigure({ url: "http://localhost.com" });

const window = instance.window;

window.requestAnimationFrame = setImmediate as unknown as (typeof window)["requestAnimationFrame"];

const windows = [window];

window.open = url =>
{
    const instance = new JSDOM();

    instance.reconfigure({ url: `http://localhost.com${url}` });

    windows.push(instance.window);

    return instance.window as object as Window;
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
        MutationObserver:      window.MutationObserver,
        NamedNodeMap:          window.NamedNodeMap,
        Node:                  window.Node,
        NodeList:              window.NodeList,
        ShadowRoot:            window.ShadowRoot,
        Window:                window.constructor,
        customElements:        window.customElements,
        document:              window.document,
        location:              window.location,
        navigator:             window.navigator,
        requestAnimationFrame: window.requestAnimationFrame,
        window,
        windows,
    },
);

if (!global.crypto)
{
    Object.assign(global, { crypto });
}

declare global
{
    const windows: Window[];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Crypto
    {
        randomUUID(): string;
    }
}

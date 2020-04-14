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
                return await new Promise(resolve => window.setTimeout(resolve, 0));
            }
        } as CustomElementRegistry,
        requestAnimationFrame(callback: FrameRequestCallback)
        {
            process.nextTick(callback);
        }
    }
);

Object.assign
(
    global,
    {
        __registries__:   registries,
        CSSStyleSheet:    class CSSStyleSheet { public replaceSync(): void { return; } },
        document:         window.document,
        DOMTokenList:     window.DOMTokenList,
        Event:            window.Event,
        HTMLElement:      window.HTMLElement,
        HTMLInputElement: window.HTMLInputElement,
        location:         window.location,
        NamedNodeMap:     window.NamedNodeMap,
        navigator:        window.navigator,
        Node:             window.Node,
        NodeList:         window.NodeList,
        window:           window,
        Window:           window.constructor,
    }
);
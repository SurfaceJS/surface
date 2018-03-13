import { JSDOM } from "jsdom";

const window = new JSDOM().window;

global["HTMLElement"]  = window.HTMLElement;
global["NodeList"]     = window.NodeList;
global["NamedNodeMap"] = window.NamedNodeMap;
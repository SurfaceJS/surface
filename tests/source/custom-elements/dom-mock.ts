import { JSDOM } from "jsdom";

const $window = new JSDOM().window;

global["window"]       = $window;
global["NodeList"]     = $window.NodeList;
global["NamedNodeMap"] = $window.NamedNodeMap;
global["HTMLElement"]  = $window.HTMLElement;
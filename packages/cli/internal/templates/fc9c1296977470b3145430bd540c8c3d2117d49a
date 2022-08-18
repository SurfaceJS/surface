import HTMLXElement, { element } from "@surface/htmlx-element";

@element("app-root", { template: "<h1>Hello {host.name}!!!</h1>", style: "h1 { color: blue; }" })
class App extends HTMLXElement
{
    public name = "World";
}

document.body.append(new App());
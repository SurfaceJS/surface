import CustomElement, { element } from "@surface/custom-element";


@element("app-roo", "<h1>Hello {host.name}!!!</h1>", "h1 { color: blue; }")
class App extends CustomElement
{
    public name = "World";
}

document.body.append(new App());
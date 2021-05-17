## TDLR
...

## Getting Started

Currently

Simple component using typescript.

```ts
import CustomElement, { element } from "@surface/custom-element";

const template = "<span>Hello {host.name}!!!</span>";

@element("my-element", template)
export default class MyElement extends CustomElement
{
    public name: string = "World";
}
```

Only javascript.
```js
import CustomElement, { element } from "@surface/custom-element";

const template = "<span>Hello {host.name}!!!</span>";


class _MyElement extends CustomElement
{
    public name = "World";
}

const MyElement = element("my-element", template)(_MyElement);

export default MyElement;

```
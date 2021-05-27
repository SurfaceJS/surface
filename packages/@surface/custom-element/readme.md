## Introduction
Surface@CustomElement is a library that adds the ability to use directives and data bindings within web components templates.  
Fully compatible with other libraries and frameworks and requires a minimun ESM compatible enviroment to run.

## Getting Started
A minimal component requires two things: Extend the Custom Element class and annotate the class with the element's decorator.

Simple hello world component

Typescript.
```ts
import CustomElement, { element } from "@surface/custom-element";

const template = "<span>Hello {host.name}!!!</span>";

@element("my-element", template)
class MyElement extends CustomElement
{
    public name: string = "World";
}

document.body.appendChild(new MyElement());
```

Javascript.
```js
import CustomElement, { element } from "@surface/custom-element";

const template = "<span>Hello {host.name}!!!</span>";

class _MyElement extends CustomElement
{
    public name = "World";
}

const MyElement = element("my-element", template)(_MyElement);

document.body.appendChild(new MyElement());
```

## Templating
Templates can contain 3 types of directives: **interpolation**, **bindings**, and **statements**.

## Interpolation
Interpolation has the syntax "Some Text {expression}" and can be used in the text node or in the attributes.

```html
<my-element style="display: {host.display}">Hello {host.name}</my-element>
```

## Bindings
Bindings support both one way and two way flow.

One Way
```html
<my-element :message="'Hello ' + host.name"></my-element>
```

Two Way
```html
<my-element ::message="host.message"></my-element>
```

Notices that two way data binding suports only static property member expressions.

Following example is not allowed.
```html
<my-element ::message="host[key]"></my-element>
```

## Reactivity
The core of the binding system is reactivity that allows the ui keep sync with the data.
Templates can evaluate almost any valid javascript expression¹. But only properties can be observed.

Example assuming that the scope contains an variable called ammount and item:
```html
<span>The value is: {(host.value + item.value) * ammount}</span>
```

The above expression only be reevaluated when the properties **host.value** or **item.value** changes since the variables like **ammount** are not reactive.

## Scopes
Reactivity depends on the scope which may vary according to the context.

The top scope of the tamplates is composed by the browser globals, **host** and **this**,

```ts
type Scope = Window & { host: MyElement, this?: HTMLElement }
```

The **host** variable is the template owner (shadowdom host), while the **this** is the element being binded and is evaluated to undefined at root level.

Examples:
```html
<div>{this.nodeName}<span name="{this.nodeName}">{this.nodeName}</span></div>
<!-- Resusts -->
<div>DIV<span name="SPAN">SPAN</span></div>
```
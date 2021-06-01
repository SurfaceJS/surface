# Summary
* [Introduction](#introduction)
* [Getting Started](#getting-started)
* [Templating](#templating)
* [Interpolation](#interpolation)
* [Bindings](#bindings)
    * [One Way](#one-way)
    * [Two Way](#two-way)
    * [Events](#events)
    * [Class and Style](#class-and-style)
* [Reactivity](#reactivity)
    * [Computed properties](#computed-properties)
    * [Scopes](#scopes)
* [Template Directive Statements](#template-directive-statements)
    * [Conditional](#conditional)
    * [Loop](#loop)
    * [Placeholder and Injection](#placeholder-and-injection)
        * [Dynamic keys](#dynamic-keys)
    * [Styling injections](#styling-injections)
    * [Awaiting painting](#awaiting-painting)
    * [Custom Directives](#custom-directives)
* [Helpers](#helpers)

# Introduction
...

**@surface/custom-element** adds the ability to use directives and data bindings within web components templates.  
Fully compatible with other libraries and frameworks and just requires a ESM compatible enviroment to run.

# Getting Started
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

Javascript (no decorators).
```js
import CustomElement, { element } from "@surface/custom-element";

const template = "<span>Hello {host.name}!!!</span>";

class _MyElement extends CustomElement
{
    name = "World";
}

const MyElement = element("my-element", template)(_MyElement);

document.body.appendChild(new MyElement());
```

Note that currently custom elements are registered at declaration time in the global scope due a limitation of the current [web components spec](https://www.webcomponents.org/specs). This is expected to change with the arrival of [Custom Element Registry](https://github.com/WICG/webcomponents/pull/865).

## Templating
Templates are where the magic happens. It can handle some types of directives to present data in dynamic ways.

### Interpolation
Interpolation has the syntax `"Some Text {expression}"` and can be used in the text node or in the attributes.

```html
<my-element title="Hello {host.display}">Hello {host.name}</my-element>
```

### Bindings
Bindings support both `one way` and `two way` flow.

#### One Way
```html
<my-element :message="'Hello ' + host.name"></my-element>
```

#### Two Way
```html
<my-element ::message="host.message"></my-element>
```

Notices that two way data binding suports only static property member expressions.

Following example is not allowed.
```html
<my-element ::message="host[key]"></my-element>
```

#### Events
Binded events are executed in the scope of the template as opposed to events passed by attributes that are executed in the global scope.

```html
<!--self-bounded-handler-->
<my-element @click="host.clickHandler"></my-element>

<!--lambda-handler-->
<my-element @click="event => host.clickHandler(event)"></my-element>

<!--headerless-lambda-->
<my-element @click="host.toogle = !host.toogle"></my-element>
<!--desugared to-->
<my-element @click="() => host.toogle = !host.toogle"></my-element>
```

#### Class and Style
**`class`** and **`style`** properties has a special binding handlers.

**`class`** bindind expects an object of type `Record<string, boolean>` where only truthy properties will be added to the class list.

```html
<my-element :class="{ foo: true, bar: false }"></my-element>
<!--results-->
<my-element class="foo"></my-element>
```

**`style`** bindind expects an object of type `Record<string, string>` where all properties will be converted to css properties.

```html
<my-element :style="{ display: host.display /* flex */ }"></my-element>
<!--results-->
<my-element style="display: flex"></my-element>
```

### Reactivity
The core of the binding system is reactivity that allows the ui keep sync with the data.  
Templates can evaluate almost any valid javascript expression ([see more](../expression/readme.md)). But only properties can be observed and requires that observed properties to be **`configurable`** and not **`readonly`**.  

By design, no error or warning will be fired when trying to use an non observable property in an expression. Except for **two way** binding higher members.

Example assuming that the scope contains variables called amount and item:
```html
<span>The value is: {(host.value + item.value) * amount}</span>
```

The above expression only be reevaluated when the properties **`host.value`** or **`item.value`** changes since the variables like **amount** are not reactive.

### Computed properties
Since readonly properties cannot be observed, to make them reactive it is necessary to map their dependencies ([see more](#helpers)).

```ts
import CustomElement, { computed, element } from "@surface/custom-element";

const template = "<span>Computed: {host.sum}</span>";

@element("my-element", template)
class MyElement extends CustomElement
{
    private a: number = 0;
    private b: number = 0;

    // When **a** or **b** changes, the **sum** is notified.
    @computed("a", "b")
    public get sum(): number
    {
        return this.a + this.b;
    }
}
```

### Scopes
Reactivity depends on the scope which may vary according to the context.

The top scope of the tamplates is composed by the browser globals, **`host`** and **`this`**,

```ts
type Scope = Window & { host: MyElement, this?: HTMLElement }
```

The **`host`** variable is the template owner (shadowroot host), while the **`this`** is the element being binded and is evaluated to undefined at root level.

```html
<div>{this.nodeName}<span name="{this.nodeName}">{this.nodeName}</span></div>
<!-- Results -->
<div>DIV<span name="SPAN">SPAN</span></div>
```

### Template Directive Statements
Template Directive Statements allows us to dynamically create content associated with local scopes.

Directives can be used with templates or elements.

```html
<template #if="true">OK</template>
<span #else>NOT OK</span>
```

It can also be composed where the decomposition will follow the order of directives.

```html
<span #if="host.items.lenght > 0" #for="item of host.items">{item.name}</span>
<span #else>No data avaliable</span>
<!--decomposes-to-->
<template #if="host.items.lenght > 0">
    <template #for="item of host.items">
        <span>{item.name}</span>
    </template>
</template>
<template #else>
    <span>No data avaliable</span>
</template>
```

### Conditional
Conditional directive statement are well straightforward.
If the expression evaluated is truthy, the template is inserted.

```html
<span #if="host.value == 1">ONE</span>
<span #else-if="host.value == 2">TWO</span>
<span #else>OTHER</span>
```

### Loop
The loop directive works similarly to its js counterpart. Also supporting **`"for in"`**, **`"for of"`** and **`array and object destructuring`**.

```html
<span #for="item of host.items">Name: {item.name}</span>

<span #for="index in host.items">Name: {host.items[index].name}</span>

<span #for="{ name } of host.items">Name: {name}</span>

<span #for="[key, value] of Object.entries(host.items)">{key}: {value}</span>
```

### Placeholder and Injection
If you have already worked with a javascript framework then you should already be familiar with the concept of [transclusion](https://en.wikipedia.org/wiki/Transclusion).

Transclusion means the inclusion of the content of one document within another document by reference.

Html5 already provides this through slots.

On surface/custom-element, templates additionally provide the ability to inject the client's html into the component's shadowdom.

```html
<!--my-element-->
<div class="card">
    <template #placeholder:header>
        <!-- Default content (optional) -->
        <span>{host.header}</span>
    </template>
</div>
<!--my-element/-->

<my-element>
    <span #inject:header>Custom Header</span>
</my-element>
```

### Slots vs Placeholders
You might have thought that what would be possible to get the same result as above using slots.

You're right.

```html
<!--my-element-->
<div class="card">
    <slot name="header">
        <span>{host.header}</span>
    </slot>
</div>
<!--my-element/-->

<my-element>
    <span slot="header">Custom Header</span>
</my-element>
```

The key difference here are scopes.  

Something that Vue users are already familiar with.

Placeholders allow you to expose scopes that injections can use to customize the presentation.

```html
<!--my-element-->
<div class="card">
    <span #placeholder:header="{ header: host.header }">{host.header}</span>
</div>
<!--my-element/-->

<my-element>
    <span #inject:header="scope">{scope.header}</span>
</my-element>
<!-- destructured also supported -->
<my-element>
    <span #inject:header="{ header }">{header}</span>
</my-element>
```

And, unlike slots, placeholders can instantiate the injected model many times as needed. Necessary for templating iterated data.

```html
<!--my-element-->
<div class="card">
    <table>
        <tr #for="item of host.items" #placeholder:item="{ item }">
            <td>{item.name}</td>
        </tr>
    </table>
</div>
<!--my-element/-->

<my-element>
    <tr #inject:item="{ item }">
        <td>{item.name}</td>
    </tr>
</my-element>
```

## Dynamic keys
**`#placeholder`** and **`#inject`** also supports dynamic keys using the syntax:

```html
<span #placeholder="scope" #placeholder-key="key"></span>
<span #inject="scope" #inject-key="key"></span>
```

Usefull to elaborate more complex scenarios.  

```html
<!--my-element-->
<table>
    <th #for="header of host.headers">
        <template #placeholder="{ header }" #placeholder-key="`header.${header}`">{header}</template>
    </th>
    <tr #for="item of host.items">
        <td #for="header of host.headers">
            <template #placeholder="{ value: item[header] }" #placeholder-key="`item.${header}`">{item.name}</template>
        </td>
    </tr>
</table>
<!--my-element/-->

<my-element :headers="['id', 'name']">
    <!--headers-->
    <template #inject:header.id="{ header }"><b>{header}</b></template>
    <template #inject:header.name="{ header }">{header}</template>
    <!--columns-->
    <template #inject:item.id="{ value }"><b>{value}</b></template>
    <template #inject:item.name="{ value }">{value}</template>
</my-element>
```

### Styling injections
How said before. The injected templates are placed inside the shadowdom.  
Therefore, they are not affected by external CSS rules unless the css parts of the element are specified.

```css
my-element::part(header)
{
    color: red;
}
```

```html
<!--my-element-->
<template #placeholder:header>
    <div>Title</div>
</template>
<!--my-element/-->

<my-element>
    <template #inject:header>
        <span part="header">Custom Title</span>
    </template>
</my-element>
```

### Awaiting painting
...

### Custom Directives
Custom directives enables behaviors without a need to dive into the elements internals.
It must be created extending the `Directive` class and registering using `CustomElement.registerDirective` on global scope or element scope through `@element` decorator.

```ts
import type { DirectiveContext }   from "@surface/custom-element";
import CustomElement { Directive } from "@surface/custom-element";

class ShowDirective extends Directive
{
    private display: string;

    public constructor(context: DirectiveContext)
    {
        super(context);

        this.display = context.element.style.display;
    }

    protected onValueChange(value: boolean): void
    {
        this.context.element.style.display = value ? this.display : "none";
    }
}

// Registered at global scope
CustomElement.registerDirective("show", ShowDirective);

// Registered at my-element scope
@element("my-element", "", "", { directives: { 'el-show': ShowDirective } })
class MyElement extends CustomElement
{ /* ... */ }
```

```html
<span #show="host.show">
    Show if host.show is true
</span>

<span #el-show="host.show">
    Show if host.show is true
</span>
```

## Helpers
...

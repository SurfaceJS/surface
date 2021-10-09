// eslint-disable-next-line import/no-unassigned-import
import "@surface/dom-shim";

import { uuidv4 }                  from "@surface/core";
import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import CustomElement               from "../internal/custom-element.js";
import attribute                   from "../internal/decorators/attribute.js";
import element                     from "../internal/decorators/element.js";
import CustomDirective             from "./fixtures/custom-directive.js";

@suite
export default class DecoratorsSpec
{
    @test @shouldPass
    public elementDecoratorHtmlElementWithObservedAttibute(): void
    {
        @element(`mock-${uuidv4()}` as `${string}-${string}`)
        class Mock extends CustomElement
        {
            public static observedAttributes?: string[];

            private _property: string = "value";

            @attribute
            public field: string = "";

            @attribute
            public get property(): string
            {
                return this._property;
            }

            public set property(value: string)
            {
                this._property = value;
            }
        }

        chai.assert.doesNotThrow(() => new Mock());
        chai.assert.deepEqual(Mock.observedAttributes, ["field", "property"]);
    }

    // @test @shouldPass
    // public elementDecoratorHtmlElementWithMultiplesObservedAttibute(): void
    // {
    //     @element(`mock-${uuidv4()}` as `${string}-${string}`)
    //     class Mock extends CustomElement
    //     {
    //         public static observedAttributes?: string[];

    //         private _value1: number = 1;
    //         private _value2: number = 1;

    //         @attribute(Object)
    //         public get value1(): Object
    //         {
    //             return this._value1;
    //         }

    //         public set value1(value: Object)
    //         {
    //             this._value1 = value;
    //         }

    //         @attribute
    //         public get value2(): number
    //         {
    //             return this._value2;
    //         }

    //         public set value2(value: number)
    //         {
    //             this._value2 = value;
    //         }

    //         public constructor()
    //         {
    //             super();
    //         }
    //     }

    //     chai.assert.doesNotThrow(() => new Mock());
    //     chai.assert.deepEqual(Mock.observedAttributes, ["value-1", "value-2"]);
    // }

    @test @shouldPass
    public elementDecoratorCustomElement(): void
    {
        @element(`mock-${uuidv4()}` as `${string}-${string}`)
        class Mock extends CustomElement
        {
            public constructor()
            {
                super();
            }
        }

        chai.assert.doesNotThrow(() => new Mock());
    }

    @test @shouldPass
    public elementDecoratorCustomElementWithTemplate(): void
    {
        @element(`mock-${uuidv4()}` as `${string}-${string}`, { template: "<div>Template</div>" })
        class Mock extends CustomElement
        {
            public constructor()
            {
                super();
            }
        }

        chai.assert.doesNotThrow(() => new Mock());
    }

    @test @shouldPass
    public elementDecoratorCustomElementWithTemplateAndStyle(): void
    {
        @element(`mock-${uuidv4()}` as `${string}-${string}`, { style: ["div { color: red; }"], template: "<div>Template</div>" })
        class Mock extends CustomElement
        {
            public constructor()
            {
                super();
            }
        }

        chai.assert.doesNotThrow(() => new Mock());
    }

    @test @shouldPass
    public elementDecoratorCustomElementWithTemplateAndStyleAndOptions(): void
    {
        const options =
        {
            directives: { custom: CustomDirective },
            extends:    "div",
            style:      "div { color: red; }",
            template:   "<div #custom>Template</div>",
        };

        @element(`mock-${uuidv4()}` as `${string}-${string}`, options)
        class Mock extends CustomElement.as(HTMLDivElement)
        {
            public constructor()
            {
                super();
            }
        }

        chai.assert.doesNotThrow(() => new Mock());
    }
}
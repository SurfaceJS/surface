// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom.js";

import { uuidv4 }                  from "@surface/core";
import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import CustomElement               from "../internal/custom-element.js";
import attribute                   from "../internal/decorators/attribute.js";
import element                     from "../internal/decorators/element.js";
import CustomDirectiveHandler from "./fixtures/custom-directive.js";

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

            private _value: Object = 1;

            @attribute
            public get value(): Object
            {
                return this._value;
            }

            public set value(value: Object)
            {
                this._value = value;
            }

            public constructor()
            {
                super();
            }
        }

        chai.assert.doesNotThrow(() => new Mock());
        chai.assert.deepEqual(Mock.observedAttributes, ["value"]);
    }

    @test @shouldPass
    public elementDecoratorHtmlElementWithMultiplesObservedAttibute(): void
    {
        @element(`mock-${uuidv4()}` as `${string}-${string}`)
        class Mock extends CustomElement
        {
            public static observedAttributes?: string[];

            @attribute
            public get value1(): Object
            {
                return this._value1;
            }

            public set value1(value: Object)
            {
                this._value1 = value;
            }

            @attribute
            public get value2(): Object
            {
                return this._value2;
            }

            public set value2(value: Object)
            {
                this._value2 = value;
            }

            private _value1: Object = 1;

            private _value2: Object = 1;

            public constructor()
            {
                super();
            }
        }

        chai.assert.doesNotThrow(() => new Mock());
        chai.assert.deepEqual(Mock.observedAttributes, ["value-1", "value-2"]);
    }

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
        @element(`mock-${uuidv4()}` as `${string}-${string}`, "<div>Template</div>")
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
        @element(`mock-${uuidv4()}` as `${string}-${string}`, "<div>Template</div>", "div { color: red; }")
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
        @element(`mock-${uuidv4()}` as `${string}-${string}`, "<div #custom>Template</div>", "div { color: red; }", { directives: { custom: CustomDirectiveHandler }, extends: "div" })
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
import "./fixtures/dom";

import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                              from "chai";
import CustomElement                           from "..";
import { attribute, element }                  from "../decorators";

@suite
export default class DecoratorsSpec
{
    @test @shouldPass
    public elementDecoratorHtmlElement(): void
    {
        @element("mock-element")
        class Mock extends HTMLElement
        { }

        expect(() => new Mock()).to.not.throw();
    }

    @test @shouldPass
    public elementDecoratorHtmlElementWithObservedAttibute(): void
    {
        @element("mock-element")
        class Mock extends CustomElement
        {
            public static observedAttributes?: Array<string>;

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

        expect(() => new Mock()).to.not.throw();
        expect(Mock.observedAttributes).to.deep.equal(["value"]);
    }

    @test @shouldPass
    public elementDecoratorHtmlElementWithMultiplesObservedAttibute(): void
    {
        @element("mock-element")
        class Mock extends CustomElement
        {
            public static observedAttributes?: Array<string>;

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

        expect(() => new Mock()).to.not.throw();
        expect(Mock.observedAttributes).to.deep.equal(["value1", "value2"]);
    }

    @test @shouldPass
    public elementDecoratorCustomElement(): void
    {
        @element("mock-element")
        class Mock extends CustomElement
        {
            public constructor()
            {
                super();
            }
        }

        expect(() => new Mock()).to.not.throw();
    }

    @test @shouldPass
    public elementDecoratorCustomElementWithTemplate(): void
    {
        @element("mock-element", "<div>Template</div>")
        class Mock extends CustomElement
        {
            public constructor()
            {
                super();
            }
        }

        expect(() => new Mock()).to.not.throw();
    }

    @test @shouldPass
    public elementDecoratorCustomElementWithTemplateAndStyle(): void
    {
        @element("mock-element", "<div>Template</div>", "div { color: red; }")
        class Mock extends CustomElement
        {
            public constructor()
            {
                super();
            }
        }

        expect(() => new Mock()).to.not.throw();
    }

    @test @shouldPass
    public elementDecoratorCustomElementWithTemplateAndStyleAndShadyCss(): void
    {
        @element("mock-element", "<div>Template</div>", "div { color: red; }", { extends: "div" })
        class Mock extends CustomElement
        {
            public constructor()
            {
                super();
            }
        }

        expect(() => new Mock()).to.not.throw();
    }

    @test @shouldFail
    public elementDecoratorOnNonHtmlElementSubclass(): void
    {
        class Mock
        { }

        expect(() => element("mock-element")(Mock))
            .to.throw(TypeError, "Target is not an valid subclass of HTMLElement");
    }

    @test @shouldFail
    public attributeDecoratorOnNonHtmlElementSubclass(): void
    {
        class Mock
        {

            private _value: Object = 1;
            public get value(): Object
            {
                return this._value;
            }

            public set value(value: Object)
            {
                this._value = value;
            }
        }

        expect(() => attribute(Mock.prototype, "value", Object.getOwnPropertyDescriptor(Mock.prototype, "value")!))
            .to.throw(TypeError, "Target is not an valid instance of HTMLElement");
    }

    @test @shouldFail
    public decorateNonHtmlElementSubclass(): void
    {
        class Mock
        { }

        expect(() => element("mock-element")(Mock))
            .to.throw(TypeError, "Target is not an valid subclass of HTMLElement");
    }
}
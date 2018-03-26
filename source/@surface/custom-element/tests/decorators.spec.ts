import "./fixtures/dom";

import { category, suite, test } from "@surface/test-suite";
import { expect }                from "chai";
import CustomElement             from "..";
import { attribute, element }    from "../decorators";

@suite("Decorators")
export default class DecoratorsSpec
{
    @category("Should work")
    @test("Element extending HTMLElement")
    public elementDecoratorHTMLElement(): void
    {
        @element("mock-element")
        class Mock extends HTMLElement
        { }

        expect(() => new Mock()).to.not.throw();
    }

    @category("Should work")
    @test("Element extending HTMLElement with observed attibute")
    public elementDecoratorHTMLElementWithObservedAttibute(): void
    {
        @element("mock-element")
        class Mock extends HTMLElement
        {
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
        }

        expect(() => new Mock()).to.not.throw();
        expect(Mock["observedAttributes"]).to.deep.equal(["value"]);
    }

    @category("Should work")
    @test("Element extending HTMLElement with multiples observed attibute")
    public elementDecoratorHTMLElementWithMultiplesObservedAttibute(): void
    {
        @element("mock-element")
        class Mock extends HTMLElement
        {
            private _value1: Object = 1;

            @attribute
            public get value1(): Object
            {
                return this._value1;
            }

            public set value1(value: Object)
            {
                this._value1 = value;
            }

            private _value2: Object = 1;

            @attribute
            public get value2(): Object
            {
                return this._value2;
            }

            public set value2(value: Object)
            {
                this._value2 = value;
            }
        }

        expect(() => new Mock()).to.not.throw();
        expect(Mock["observedAttributes"]).to.deep.equal(["value1", "value2"]);
    }

    @category("Should work")
    @test("Element extending CustomElement")
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

    @category("Should work")
    @test("Element extending CustomElement with template")
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

    @category("Should work")
    @test("Element extending CustomElement with template and style")
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

    @category("Should work")
    @test("Element extending CustomElement with template, style and ShadyCSS")
    public elementDecoratorCustomElementWithTemplateAndStyleAndShadyCSS(): void
    {
        window.ShadyCSS =
        {
            prepareTemplate: (template: HTMLTemplateElement, name: string, element?: string) => { return; },
            styleElement:    (element: HTMLElement) => { return; }
        };

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

    @category("Should throw")
    @test("Element decorator on non HTMLElement subclass")
    public elementDecoratorOnNonHTMLElementSubclass(): void
    {
        class Mock
        { }

        expect(() => element("mock-element")(Mock))
            .to.throw(TypeError, "Constructor is not an valid subclass of HTMLElement");
    }

    @category("Should throw")
    @test("Attribute decorator on non HTMLElement subclass")
    public aattributeDecoratorOnNonHTMLElementSubclass(): void
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

        expect(() => attribute(Mock.prototype, "value"))
            .to.throw(TypeError, "Target is not an valid subclass of HTMLElement");
    }

    @category("Should throw")
    @test("Decorate non HTMLElement subclass")
    public decorateNonHTMLElementSubclass(): void
    {
        class Mock
        { }

        expect(() => element("mock-element")(Mock))
            .to.throw(TypeError, "Constructor is not an valid subclass of HTMLElement");
    }

    @category("Should throw")
    @test("Decorate with template HTMLElement subclass")
    public decorateWithTemplateHTMLElementSubclass(): void
    {
        class Mock extends HTMLElement
        { }

        expect(() => element("mock-element", "<div>Template</div>")(Mock))
            .to.throw(TypeError, "Constructor is not an valid subclass of CustomElement");
    }
}
// eslint-disable-next-line import/no-unassigned-import
import "@surface/dom-shim";

import { scheduler }               from "@surface/htmlx";
import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import attribute                   from "../../internal/decorators/attribute.js";
import element                     from "../../internal/decorators/element.js";
import HTMLXElement                from "../../internal/htmlx-element.js";

@suite
export default class ElementDecoratorSpec
{
    @test @shouldPass
    public async elementWithDefaults(): Promise<void>
    {
        @element(`mock-${crypto.randomUUID()}` as `${string}-${string}`)
        class Mock extends HTMLXElement
        {
            public static observedAttributes?: string[];

            private _property: string = "";

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

        assert.deepEqual(Mock.observedAttributes, ["field", "property"]);

        const mock = new Mock();

        assert.equal(mock.field, "");
        assert.equal(mock.property, "");

        assert.equal(mock.getAttribute("field"), null);
        assert.equal(mock.getAttribute("property"), null);

        mock.field    = "changed";
        mock.property = "changed";

        await scheduler.execution();

        assert.equal(mock.getAttribute("field"), "changed");
        assert.equal(mock.getAttribute("property"), "changed");

        mock.setAttribute("field", "changed-again");
        mock.setAttribute("property", "changed-again");

        await scheduler.execution();

        assert.equal(mock.field, "changed-again");
        assert.equal(mock.property, "changed-again");
    }

    @test @shouldPass
    public async elementWithDefaultsAndAttributeChangedCallback(): Promise<void>
    {
        @element(`mock-${crypto.randomUUID()}` as `${string}-${string}`)
        class Mock extends HTMLXElement
        {
            @attribute
            public field: string = "";

            public callbackValue: string = "";

            public attributeChangedCallback(name: string, _: string | undefined, value: string): void
            {
                this.callbackValue = `${name}:${value}`;
            }
        }

        const mock = new Mock();

        assert.equal(mock.field, "");
        assert.equal(mock.callbackValue, "");

        assert.equal(mock.getAttribute("field"), null);

        mock.field = "changed";

        await scheduler.execution();

        assert.equal(mock.getAttribute("field"), "changed");
        assert.equal(mock.field, "changed");
        assert.equal(mock.callbackValue, "field:changed");

        mock.setAttribute("field", "changed-again");

        await scheduler.execution();

        assert.equal(mock.getAttribute("field"), "changed-again");
        assert.equal(mock.field, "changed-again");
        assert.equal(mock.callbackValue, "field:changed-again");
    }

    @test @shouldPass
    public async elementWithDefaultsAndAttributeChangedCallbackWithInheritance(): Promise<void>
    {
        class Base extends HTMLXElement
        {
            private _baseProperty: string = "";

            public baseCallbackValue: string = "";

            @attribute
            public get baseProperty(): string
            {
                return this._baseProperty;
            }

            public set baseProperty(value: string)
            {
                this._baseProperty = value;
            }

            public attributeChangedCallback(name: string, _: string | undefined, value: string): void
            {
                this.baseCallbackValue = `${name}:${value}`;
            }
        }

        @element(`mock-${crypto.randomUUID()}` as `${string}-${string}`)
        class Mock extends Base
        {
            private _property: string = "";
            public callbackValue: string = "";

            @attribute
            public get property(): string
            {
                return this._property;
            }

            public set property(value: string)
            {
                this._property = value;
            }

            public override attributeChangedCallback(name: string, _: string | undefined, value: string): void
            {
                super.attributeChangedCallback(name, _, value);

                this.callbackValue = `${name}:${value}`;
            }
        }

        const mock = new Mock();

        assert.equal(mock.property, "");
        assert.equal(mock.baseProperty, "");
        assert.equal(mock.callbackValue, "");
        assert.equal(mock.baseCallbackValue, "");

        assert.equal(mock.getAttribute("property"), null);

        mock.property = "changed";

        await scheduler.execution();

        assert.equal(mock.callbackValue, "property:changed");
        assert.equal(mock.getAttribute("property"), "changed");

        mock.baseProperty = "changed";

        await scheduler.execution();

        assert.equal(mock.baseCallbackValue, "base-property:changed");
        assert.equal(mock.getAttribute("base-property"), "changed");

        mock.setAttribute("property", "changed-again");

        await scheduler.execution();

        assert.equal(mock.property, "changed-again");
        assert.equal(mock.baseProperty, "changed");
        assert.equal(mock.callbackValue, "property:changed-again");
        assert.equal(mock.baseCallbackValue, "property:changed-again");

        mock.setAttribute("base-property", "changed-one-more");

        await scheduler.execution();

        assert.equal(mock.property, "changed-again");
        assert.equal(mock.baseProperty, "changed-one-more");
        assert.equal(mock.callbackValue, "base-property:changed-one-more");
        assert.equal(mock.baseCallbackValue, "base-property:changed-one-more");
    }
}

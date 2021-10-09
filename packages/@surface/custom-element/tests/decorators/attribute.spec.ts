// eslint-disable-next-line import/no-unassigned-import
import "@surface/dom-shim";

import { uuidv4 }                  from "@surface/core";
import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import { scheduler }               from "../../index.js";
import CustomElement               from "../../internal/custom-element.js";
import attribute                   from "../../internal/decorators/attribute.js";
import element                     from "../../internal/decorators/element.js";

@suite
export default class ElementDecoratorSpec
{
    // @test @shouldPass
    // public elementWithDefaults(): void
    // {
    //     @element(`mock-${uuidv4()}` as `${string}-${string}`)
    //     class Mock extends CustomElement
    //     {
    //         public static observedAttributes?: string[];

    //         private _property: string = "";

    //         @attribute
    //         public field: string = "";

    //         @attribute
    //         public get property(): string
    //         {
    //             return this._property;
    //         }

    //         public set property(value: string)
    //         {
    //             this._property = value;
    //         }
    //     }

    //     chai.assert.deepEqual(Mock.observedAttributes, ["field", "property"]);

    //     const mock = new Mock();

    //     chai.assert.equal(mock.field, "");
    //     chai.assert.equal(mock.property, "");

    //     chai.assert.equal(mock.getAttribute("field"), null);
    //     chai.assert.equal(mock.getAttribute("property"), null);

    //     mock.field    = "changed";
    //     mock.property = "changed";

    //     chai.assert.equal(mock.getAttribute("field"), "changed");
    //     chai.assert.equal(mock.getAttribute("property"), "changed");

    //     mock.setAttribute("field", "changed-again");
    //     mock.setAttribute("property", "changed-again");

    //     chai.assert.equal(mock.field, "changed-again");
    //     chai.assert.equal(mock.property, "changed-again");
    // }

    // @test @shouldPass
    // public elementWithDefaultsAndAttributeChangedCallback(): void
    // {
    //     @element(`mock-${uuidv4()}` as `${string}-${string}`)
    //     class Mock extends CustomElement
    //     {
    //         @attribute
    //         public field: string = "";

    //         public callbackValue: string = "";

    //         public attributeChangedCallback(name: string, _: string | undefined, value: string): void
    //         {
    //             this.callbackValue = `${name}:${value}`;
    //         }
    //     }

    //     const mock = new Mock();

    //     chai.assert.equal(mock.field, "");
    //     chai.assert.equal(mock.callbackValue, "");

    //     chai.assert.equal(mock.getAttribute("field"), null);

    //     mock.field = "changed";

    //     chai.assert.equal(mock.callbackValue, "");
    //     chai.assert.equal(mock.getAttribute("field"), "changed");

    //     mock.setAttribute("field", "changed-again");

    //     chai.assert.equal(mock.field, "changed-again");
    //     chai.assert.equal(mock.callbackValue, "field:changed-again");
    // }

    @test @shouldPass
    public async elementWithDefaultsAndAttributeChangedCallbackWithInheritance(): Promise<void>
    {
        class Base extends CustomElement
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

        @element(`mock-${uuidv4()}` as `${string}-${string}`)
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

            public attributeChangedCallback(name: string, _: string | undefined, value: string): void
            {
                super.attributeChangedCallback(name, _, value);

                this.callbackValue = `${name}:${value}`;
            }
        }

        const mock = new Mock();

        chai.assert.equal(mock.property, "");
        chai.assert.equal(mock.baseProperty, "");
        chai.assert.equal(mock.callbackValue, "");
        chai.assert.equal(mock.baseCallbackValue, "");

        chai.assert.equal(mock.getAttribute("property"), null);

        mock.property = "changed";

        await scheduler.execution();

        chai.assert.equal(mock.callbackValue, "property:changed");
        chai.assert.equal(mock.getAttribute("property"), "changed");

        mock.baseProperty = "changed";

        await scheduler.execution();

        chai.assert.equal(mock.baseCallbackValue, "base-property:changed");
        chai.assert.equal(mock.getAttribute("base-property"), "changed");

        mock.setAttribute("property", "changed-again");

        await scheduler.execution();

        chai.assert.equal(mock.property, "changed-again");
        chai.assert.equal(mock.baseProperty, "changed");
        chai.assert.equal(mock.callbackValue, "property:changed-again");
        chai.assert.equal(mock.baseCallbackValue, "property:changed-again");

        mock.setAttribute("base-property", "changed-one-more");

        await scheduler.execution();

        chai.assert.equal(mock.property, "changed-again");
        chai.assert.equal(mock.baseProperty, "changed-one-more");
        chai.assert.equal(mock.callbackValue, "base-property:changed-one-more");
        chai.assert.equal(mock.baseCallbackValue, "base-property:changed-one-more");
    }
}
import "./fixtures/dom";

import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                              from "chai";
import DataBind                                from "../internal/data-bind";

@suite
export default class DataBindSpec
{
    @test @shouldPass
    public oneWayObjectDataBind(): void
    {
        class Mock
        {
            private _value: number = 1;
            public get value(): number
            {
                return this._value;
            }

            public set value(value: number)
            {
                this._value = value;
            }
        }

        const target = new Mock();

        let changed = false;
        DataBind.oneWay(target, "value", () => changed = true);

        target.value = 2;

        expect(changed).to.equal(true);
    }

    @test @shouldPass
    public oneWayElementDataBind(): void
    {
        const target = document.createElement("input");
        target.value = "1";

        let changed = false;
        DataBind.oneWay(target, "value", () => changed = true);

        target.value = "2";
        target.dispatchEvent(new Event("change"));
        target.dispatchEvent(new Event("keyup"));
        expect(changed).to.equal(true);
    }

    @test @shouldPass
    public oneWayAttributeDataBind(): void
    {
        const target = document.createElement("input");
        target.setAttribute("data-value", "1");

        const attribute = target.attributes[0];

        let value = "1";
        DataBind.oneWay(attribute, "value", () => value = attribute.value);

        attribute.value = "2";
        expect(value).to.equal("2");
    }

    @test @shouldPass
    public oneWayPropertyAttributeDataBind(): void
    {
        const target = document.createElement("div");
        target.lang = "pt-br";

        let value = target.lang;
        DataBind.oneWay(target, "lang", () => value = target.lang);

        target.setAttribute("lang", "en-us");
        target.setAttribute("lang1", "en-us");
        expect(value).to.equal("en-us");
        expect(target.getAttribute("lang1")).to.equal("en-us");
    }

    @test @shouldPass
    public twoWayObjectDataBind(): void
    {
        class Mock
        {
            private _value: number = 1;
            public get value(): number
            {
                return this._value;
            }

            public set value(value: number)
            {
                this._value = value;
            }
        }

        const target = new Mock();
        const source = new Mock();

        DataBind.twoWay(target, "value", source, "value");

        target.value = 2;

        expect(source.value).to.equal(2);

        source.value = 3;

        expect(target.value).to.equal(3);
    }

    @test @shouldFail
    public invalidMember(): void
    {
        const target = { value: 1 };

        expect(() => DataBind.oneWay(target, "value", () => null)).to.throw(Error, "Property value does not exist on Object type");
    }
}
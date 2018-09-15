import "./fixtures/dom";

import Type                        from "@surface/reflection/type";
import { shouldPass, suite, test } from "@surface/test-suite";
import * as chai                   from "chai";
import DataBind                    from "../internal/data-bind";

@suite
export default class DataBindSpec
{
    @test @shouldPass
    public oneWayFieldDataBind(): void
    {
        const target = { value: 1 };

        let changed = false;

        DataBind.oneWay(target, Type.from(target).getField("value")!, () => changed = true);

        target.value = 2;

        chai.expect(changed).to.equal(true);
    }

    @test @shouldPass
    public oneWayReadonlyFieldDataBind(): void
    {
        const target = { value: 1 };

        Object.defineProperty(target, "value", { value: target.value, writable: false });

        let changed = false;

        DataBind.oneWay(target, Type.from(target).getField("value")!, () => changed = true);

        target.value = 2;

        chai.expect(changed).to.equal(true);
    }

    @test @shouldPass
    public oneWayPropertyDataBind(): void
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

        DataBind.oneWay(target, Type.of(Mock).getProperty("value")!, () => changed = true);

        target.value = 2;

        chai.expect(changed).to.equal(true);
    }

    @test @shouldPass
    public oneWayReadonlyPropertyDataBind(): void
    {
        class Mock
        {
            private _value: number = 1;
            public get value(): number
            {
                return this._value;
            }

            public setValue(value: number): void
            {
                this._value = value;
            }
        }

        const target = new Mock();

        let changed = false;

        DataBind.oneWay(target, Type.of(Mock).getProperty("value")!, () => changed = true);

        target.setValue(2);

        chai.expect(changed).to.equal(true);
    }

    @test @shouldPass
    public oneWayElementDataBind(): void
    {
        const target = document.createElement("input");
        target.value = "1";

        let changed = false;
        DataBind.oneWay(target, Type.from(target).getProperty("value")!, () => changed = true);

        target.value = "2";
        target.dispatchEvent(new Event("change"));
        target.dispatchEvent(new Event("keyup"));
        chai.expect(changed).to.equal(true);
    }

    @test @shouldPass
    public oneWayAttributeDataBind(): void
    {
        const target = document.createElement("input");
        target.setAttribute("data-value", "1");

        const attribute = target.attributes[0];

        let value = "1";
        DataBind.oneWay(attribute, Type.from(attribute).getProperty("value")!, () => value = attribute.value);

        attribute.value = "2";
        chai.expect(value).to.equal("2");
    }

    @test @shouldPass
    public oneWayPropertyAttributeDataBind(): void
    {
        const target = document.createElement("div");
        target.lang = "pt-br";

        let value = target.lang;
        DataBind.oneWay(target, Type.from(target).getProperty("lang")!, () => value = target.lang);

        target.setAttribute("lang", "en-us");
        target.setAttribute("lang1", "en-us");
        chai.expect(value, "value").to.equal("en-us");
        chai.expect(target.getAttribute("lang1"), "getAttribute").to.equal("en-us");
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

        const left  = new Mock();
        const right = new Mock();

        DataBind.twoWay(left, Type.from(left).getProperty("value")!, right, Type.from(right).getProperty("value")!);

        left.value = 2;

        chai.expect(right.value).to.equal(2);

        right.value = 3;

        chai.expect(left.value).to.equal(3);
    }
}
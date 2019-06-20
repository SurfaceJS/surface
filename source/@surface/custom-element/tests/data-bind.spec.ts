import "./fixtures/dom";

import { Indexer }                 from "@surface/core";
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

        DataBind.oneWay(target, "value", { notify: () => changed = true });

        target.value = 2;

        chai.expect(changed).to.equal(true);
    }

    @test @shouldPass
    public oneWayReadonlyFieldDataBind(): void
    {
        const target = { value: 1 };

        Object.defineProperty(target, "value", { value: target.value, writable: false });

        let changed = false;

        DataBind.oneWay(target, "value", { notify: () => changed = true });

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

        DataBind.oneWay(target as unknown as Indexer, "value", { notify: () => changed = true });

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

        DataBind.oneWay(target as unknown as Indexer, "value", { notify: () => changed = true });

        target.setValue(2);

        chai.expect(changed).to.equal(true);
    }

    @test @shouldPass
    public oneWayElementDataBind(): void
    {
        const target = document.createElement("input");
        target.value = "1";

        let changed = false;
        DataBind.oneWay(target as Indexer, "value", { notify: () => changed = true });

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
        DataBind.oneWay(attribute as Indexer, "value", { notify: () => value = attribute.value });

        attribute.value = "2";
        chai.expect(value).to.equal("2");
    }

    // Deprecated
    // @test @shouldPass
    // public oneWayPropertyAttributeDataBind(): void
    // {
    //     const target = document.createElement("div");
    //     target.lang = "pt-br";

    //     let value = target.lang;
    //     DataBind.oneWay(target, "lang", { notify: () => value = target.lang });

    //     target.setAttribute("lang", "en-us");
    //     target.setAttribute("lang1", "en-us");
    //     chai.expect(value, "value").to.equal("en-us");
    //     chai.expect(target.getAttribute("lang1"), "getAttribute").to.equal("en-us");
    // }

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

        DataBind.twoWay(left as Indexer, "value", right as Indexer, "value");

        left.value = 2;

        chai.expect(right.value).to.equal(2);

        right.value = 3;

        chai.expect(left.value).to.equal(3);
    }
}
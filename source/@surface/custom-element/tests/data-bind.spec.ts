import "./fixtures/dom";

import { Indexer }                 from "@surface/core";
import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
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

        assert.isTrue(changed);
    }

    @test @shouldPass
    public oneWayReadonlyFieldDataBind(): void
    {
        const target = { value: 1 };

        Object.defineProperty(target, "value", { value: target.value, writable: false });

        DataBind.oneWay(target, "value", { notify: () => undefined }); // Todo: Review if should throw error or not

        assert.isTrue(true);
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

        assert.isTrue(changed);
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

        assert.isTrue(changed);
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
        assert.isTrue(changed);
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
        assert.equal(value, "2");
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

        DataBind.twoWay(left as Indexer, "value", right as Indexer, "value");

        left.value = 2;

        assert.equal(right.value, 2);

        right.value = 3;

        assert.equal(left.value, 3);
    }

    @test @shouldPass
    public observe(): void
    {
        const target  = { value: "string" };

        let observed = false;

        DataBind.observe(target, [["value", "length"]], { notify: () => observed = true } );

        assert.isFalse(observed);
    }
}
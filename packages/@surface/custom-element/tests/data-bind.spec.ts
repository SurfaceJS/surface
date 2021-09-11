// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom.js";

import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import DataBind                    from "../internal/reactivity/data-bind-legacy.js";
import { scheduler }               from "../internal/singletons.js";

@suite
export default class DataBindSpec
{
    @test @shouldPass
    public async oneWayFieldDataBind(): Promise<void>
    {
        const target = { value: 1 };

        let changed = false;

        DataBind.oneWay(target, ["value"], () => changed = true);

        target.value = 2;

        await scheduler.execution();

        chai.assert.isTrue(changed);
    }

    @test @shouldPass
    public async oneWayReadonlyFieldDataBind(): Promise<void>
    {
        const target = { value: 1 };

        Object.defineProperty(target, "value", { value: target.value, writable: false });

        // Todo: Review if should throw error or not
        DataBind.oneWay(target, ["value"], () => undefined);

        await scheduler.execution();

        chai.assert.isTrue(true);
    }

    @test @shouldPass
    public async oneWayPropertyDataBind(): Promise<void>
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

        DataBind.oneWay(target, ["value"], () => changed = true);

        target.value = 2;

        await scheduler.execution();

        chai.assert.isTrue(changed);
    }

    @test @shouldPass
    public async oneWayReadonlyPropertyDataBind(): Promise<void>
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

        DataBind.oneWay(target, ["value"], () => changed = true);

        target.setValue(2);

        await scheduler.execution();

        chai.assert.isTrue(changed);
    }

    @test @shouldPass
    public async oneWayElementDataBind(): Promise<void>
    {
        const target = document.createElement("input");
        target.value = "1";

        let changed = false;
        DataBind.oneWay(target, ["value"], () => changed = true);

        target.value = "2";
        target.dispatchEvent(new Event("change"));
        target.dispatchEvent(new Event("keyup"));

        await scheduler.execution();

        chai.assert.isTrue(changed);
    }

    @test @shouldPass
    public async oneWayAttributeDataBind(): Promise<void>
    {
        const target = document.createElement("input");
        target.setAttribute("data-value", "1");

        const attribute = target.attributes[0];

        let value = "1";

        DataBind.oneWay(attribute, ["value"], () => value = attribute.value);

        attribute.value = "2";

        await scheduler.execution();

        chai.assert.equal(value, "2");
    }

    @test @shouldPass
    public async twoWayObjectDataBind(): Promise<void>
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

        DataBind.twoWay(left, ["value"], right, ["value"]);

        await scheduler.execution();

        left.value = 2;

        await scheduler.execution();

        chai.assert.equal(right.value, 2);

        right.value = 3;

        await scheduler.execution();

        chai.assert.equal(left.value, 3);
    }

    @test @shouldPass
    public async observe(): Promise<void>
    {
        const target  = { value: "string" };

        let observed = false;

        DataBind.observe(target, [["value", "length"]], () => observed = true);

        await scheduler.execution();

        chai.assert.isTrue(observed);
    }
}
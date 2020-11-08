// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom";

import { after, afterEach, before, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                                            from "chai";
import ChangeTracker                                         from "../internal/change-tracker";
import DataBind                                              from "../internal/data-bind";

@suite
export default class DataBindSpec
{
    @before
    public before(): void
    {
        ChangeTracker.instance.start();
    }

    @after
    public after(): void
    {
        ChangeTracker.instance.stop();
    }

    @afterEach
    public afterEach(): void
    {
        ChangeTracker.instance.clear();
    }

    @test @shouldPass
    public async oneWayFieldDataBind(): Promise<void>
    {
        const target = { value: 1 };

        let changed = false;

        DataBind.oneWay(target, ["value"], () => changed = true);

        target.value = 2;

        await ChangeTracker.instance.nextTick();

        assert.isTrue(changed);
    }

    @test @shouldPass
    public async oneWayReadonlyFieldDataBind(): Promise<void>
    {
        const target = { value: 1 };

        Object.defineProperty(target, "value", { value: target.value, writable: false });

        // Todo: Review if should throw error or not
        DataBind.oneWay(target, ["value"], () => undefined);

        await ChangeTracker.instance.nextTick();

        assert.isTrue(true);
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

        await ChangeTracker.instance.nextTick();

        assert.isTrue(changed);
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

        await ChangeTracker.instance.nextTick();

        assert.isTrue(changed);
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

        await ChangeTracker.instance.nextTick();

        assert.isTrue(changed);
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

        await ChangeTracker.instance.nextTick();

        assert.equal(value, "2");
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

        left.value = 2;

        await ChangeTracker.instance.nextTick();

        assert.equal(right.value, 2);

        right.value = 3;

        await ChangeTracker.instance.nextTick();

        assert.equal(left.value, 3);
    }

    @test @shouldPass
    public async observe(): Promise<void>
    {
        const target  = { value: "string" };

        let observed = false;

        DataBind.observe(target, [["value", "length"]], () => observed = true);

        await ChangeTracker.instance.nextTick();

        assert.isTrue(observed);
    }
}
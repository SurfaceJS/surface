// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom.js";

import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import processTemplate             from "../internal/processors/process-template-legacy.js";
import { scheduler }               from "../internal/singletons.js";

@suite
export default class ProcessorsSpec
{
    @test @shouldPass
    public process(): void
    {
        const [content] = processTemplate("Hello {message} !!!", { message: "World" });

        chai.assert.equal(content.childNodes[0].textContent, "Hello World !!!");

        const [cached] = processTemplate("Hello {message} !!!", { message: "World" });

        chai.assert.equal(cached.childNodes[0].textContent, "Hello World !!!");
    }

    @test @shouldPass
    public async processIfDirective(): Promise<void>
    {
        const scope = { host: { message: "World", visible: true } };

        const [content] = processTemplate("<span #if='host.visible'>Hello {host.message} !!!</span>", scope);

        await scheduler.execution();

        chai.assert.equal(content.childNodes[0].textContent, "#open");
        chai.assert.equal(content.childNodes[1].textContent, "Hello World !!!");
        chai.assert.equal(content.childNodes[2].textContent, "#close");

        scope.host.visible = false;

        await scheduler.execution();

        chai.assert.equal(content.childNodes[0].textContent, "#open");
        chai.assert.equal(content.childNodes[1].textContent, "#close");

        scope.host.visible = true;

        await scheduler.execution();

        chai.assert.equal(content.childNodes[0].textContent, "#open");
        chai.assert.equal(content.childNodes[1].textContent, "Hello World !!!");
        chai.assert.equal(content.childNodes[2].textContent, "#close");
    }

    @test @shouldPass
    public async processLoopDirective(): Promise<void>
    {
        const scope = { items: [] as number[] };

        const [content] = processTemplate("<span #for='item of items'>Item: {item}</span>", scope);

        const expected1 =
        [
            "#open",
            "#close",
        ];

        const actual1 = Array.from(content.childNodes).map(x => x.textContent);

        chai.assert.deepEqual(actual1, expected1, "#1");

        scope.items = [1, 2, 3];

        await scheduler.execution();

        const expected2 =
        [
            "#open",
            "#open",
            "Item: 1",
            "#close",
            "#open",
            "Item: 2",
            "#close",
            "#open",
            "Item: 3",
            "#close",
            "#close",
        ];

        const actual2 = Array.from(content.childNodes).map(x => x.textContent);

        chai.assert.deepEqual(actual2, expected2, "#2");
    }

    @test @shouldPass
    public async dispose(): Promise<void>
    {
        const scope = { host: { message: "World" } };

        const [content, disposeable] = processTemplate("Hello {host.message} !!!", scope);

        chai.assert.equal(content.childNodes[0].textContent, "Hello World !!!");

        scope.host.message = "Web";

        await scheduler.execution();

        chai.assert.equal(content.childNodes[0].textContent, "Hello Web !!!");

        disposeable.dispose();

        scope.host.message = "World";

        await scheduler.execution();

        chai.assert.equal(content.childNodes[0].textContent, "Hello Web !!!");
    }
}
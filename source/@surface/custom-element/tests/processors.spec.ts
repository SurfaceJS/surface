// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom";

import { shouldPass, suite, test }   from "@surface/test-suite";
import { assert }                    from "chai";
import { processTemplate, whenDone } from "../internal/processors";

@suite
export default class ProcessorsSpec
{
    @test @shouldPass
    public process(): void
    {
        const [content] = processTemplate("Hello {message} !!!", { message: "World" });

        assert.equal(content.childNodes[0].textContent, "Hello World !!!");

        const [cached] = processTemplate("Hello {message} !!!", { message: "World" });

        assert.equal(cached.childNodes[0].textContent, "Hello World !!!");
    }

    @test @shouldPass
    public async processIfDirective(): Promise<void>
    {
        const scope = { host: { message: "World", visible: true } };

        const [content] = processTemplate("<span #if='host.visible'>Hello {host.message} !!!</span>", scope);

        await whenDone();

        assert.equal(content.childNodes[0].textContent, "#open");
        assert.equal(content.childNodes[1].textContent, "Hello World !!!");
        assert.equal(content.childNodes[2].textContent, "#close");

        scope.host.visible = false;

        await whenDone();

        assert.equal(content.childNodes[0].textContent, "#open");
        assert.equal(content.childNodes[1].textContent, "#close");

        scope.host.visible = true;

        await whenDone();

        assert.equal(content.childNodes[0].textContent, "#open");
        assert.equal(content.childNodes[1].textContent, "Hello World !!!");
        assert.equal(content.childNodes[2].textContent, "#close");
    }

    @test @shouldPass
    public async processLoopDirective(): Promise<void>
    {
        const scope = { items: [] as number[] };

        const [content] = processTemplate("<span #for='item of items'>Item: {item}</span>", scope);

        assert.equal(content.childNodes[0].textContent, "#open");
        assert.equal(content.childNodes[1].textContent, "#close");

        scope.items = [1, 2, 3];

        await whenDone();

        assert.equal(content.childNodes[0].textContent, "#open");
        assert.equal(content.childNodes[1].textContent, "Item: 1");
        assert.equal(content.childNodes[2].textContent, "#close");
        assert.equal(content.childNodes[3].textContent, "#open");
        assert.equal(content.childNodes[4].textContent, "Item: 2");
        assert.equal(content.childNodes[5].textContent, "#close");
        assert.equal(content.childNodes[6].textContent, "#open");
        assert.equal(content.childNodes[7].textContent, "Item: 3");
        assert.equal(content.childNodes[8].textContent, "#close");
    }

    @test @shouldPass
    public dispose(): void
    {
        const scope = { host: { message: "World" } };

        const [content, disposeable] = processTemplate("Hello {host.message} !!!", scope);

        assert.equal(content.childNodes[0].textContent, "Hello World !!!");

        scope.host.message = "Web";

        assert.equal(content.childNodes[0].textContent, "Hello Web !!!");

        disposeable.dispose();

        scope.host.message = "World";

        assert.equal(content.childNodes[0].textContent, "Hello Web !!!");
    }
}
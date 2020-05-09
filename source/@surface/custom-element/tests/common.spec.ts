import "./fixtures/dom";

import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import { domPath }                 from "../internal/common";

@suite
export default class CommonSpec
{
    @test @shouldPass
    public domPath(): void
    {
        const node = document.createElement("div");

        node.innerHTML =
        [
            "<span>",
            "Text Content",
            "<p>",
            "Other Text Content",
            "<template #if='foo'>",
            "</template>",
            "</p>",
            "</span>"
        ].join("");

        const template = node.querySelector("template")!;

        const expected =
        [
            "<div>",
            "\t<span>",
            "\t\t<p>",
            "\t\t\t...1 other(s) node(s)",
            "\t\t\t<template #if=\"foo\">",
        ].join("\n");

        const actual = domPath(template);

        assert.equal(actual, expected);
    }
}
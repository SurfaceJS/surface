import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import ModuleCompiler              from "../internal/module-compiler.js";

@suite
export default class ModuleCompilerSpec
{
    @test @shouldPass
    public compileEmpty(): void
    {
        const expected =
        [
            "import {",
            "\tcreateFragmentFactory",
            "} from \"@surface/custom-element/factories\";",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[]",
            "\t);",
            "export default factory;",
        ].join("\n");

        const actual = ModuleCompiler.compile("x-component", "", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public compileWithTextNode(): void
    {
        const expected =
        [
            "import {",
            "\tcreateFragmentFactory,",
            "\tcreateTextNodeFactory",
            "} from \"@surface/custom-element/factories\";",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateTextNodeFactory(\"Hello World!!!\")",
            "\t\t]",
            "\t);",
            "export default factory;",
        ].join("\n");

        const actual = ModuleCompiler.compile("x-component", "Hello World!!!", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public compileWithElement(): void
    {
        const expected =
        [
            "import {",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory",
            "} from \"@surface/custom-element/factories\";",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"SPAN\",",
            "\t\t\t)",
            "\t\t]",
            "\t);",
            "export default factory;",
        ].join("\n");

        const actual = ModuleCompiler.compile("x-component", "<span></span>", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public compileWithElementAndAttributes(): void
    {
        const expected =
        [
            "import {",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory",
            "} from \"@surface/custom-element/factories\";",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"SPAN\",",
            "\t\t\t\t[",
            "\t\t\t\t\t[\"foo\", \"\"],",
            "\t\t\t\t\t[\"bar\", \"baz\"]",
            "\t\t\t\t],",
            "\t\t\t)",
            "\t\t]",
            "\t);",
            "export default factory;",
        ].join("\n");

        const actual = ModuleCompiler.compile("x-component", "<span foo bar=\"baz\"></span>", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public compileWithElementAndAttributesAndInterpolationBindDirective(): void
    {
        const expected =
        [
            "import {",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tcreateInterpolationFactory",
            "} from \"@surface/custom-element/factories\";",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"SPAN\",",
            "\t\t\t\t[",
            "\t\t\t\t\t[\"value\", \"\"]",
            "\t\t\t\t],",
            "\t\t\t\t[",
            "\t\t\t\t\tcreateInterpolationFactory",
            "\t\t\t\t\t(",
            "\t\t\t\t\t\t\"value\",",
            "\t\t\t\t\t\tscope => { with (scope) { return `${host.value}`; },",
            "\t\t\t\t\t\t[[\"host\",\"value\"]],",
            "\t\t\t\t\t\t\"value=\\\"{host.value}\\\"\",",
            "\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span value=\\\"{host.value}\\\">\"]],",
            "\t\t\t\t\t)",
            "\t\t\t\t],",
            "\t\t\t)",
            "\t\t]",
            "\t);",
            "export default factory;",
        ].join("\n");

        const actual = ModuleCompiler.compile("x-component", "<span value=\"{host.value}\"></span>", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public compileWithElementAndAttributesAndEventBindDirective(): void
    {
        const expected =
        [
            "import {",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tcreateEventFactory",
            "} from \"@surface/custom-element/factories\";",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"SPAN\",",
            "\t\t\t\tvoid 0,",
            "\t\t\t\t[",
            "\t\t\t\t\tcreateEventFactory",
            "\t\t\t\t\t(",
            "\t\t\t\t\t\t\"click\",",
            "\t\t\t\t\t\tscope => { with (scope) { return host.handler; },",
            "\t\t\t\t\t\tscope => { with (scope) { return host; },",
            "\t\t\t\t\t\t\"@click=\\\"host.handler\\\"\",",
            "\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span @click=\\\"host.handler\\\">\"]],",
            "\t\t\t\t\t)",
            "\t\t\t\t],",
            "\t\t\t)",
            "\t\t]",
            "\t);",
            "export default factory;",
        ].join("\n");

        const actual = ModuleCompiler.compile("x-component", "<span @click=\"host.handler\"></span>", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public compileWithElementAndAttributesAndCustomBindDirective(): void
    {
        const expected =
        [
            "import {",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tcreateDirectiveFactory",
            "} from \"@surface/custom-element/factories\";",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"SPAN\",",
            "\t\t\t\tvoid 0,",
            "\t\t\t\t[",
            "\t\t\t\t\tcreateDirectiveFactory",
            "\t\t\t\t\t(",
            "\t\t\t\t\t\t\"show\",",
            "\t\t\t\t\t\tscope => { with (scope) { return host.show; },",
            "\t\t\t\t\t\t[[\"host\",\"show\"]],",
            "\t\t\t\t\t\t\"#show=\\\"host.show\\\"\",",
            "\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span #show=\\\"host.show\\\">\"]],",
            "\t\t\t\t\t)",
            "\t\t\t\t],",
            "\t\t\t)",
            "\t\t]",
            "\t);",
            "export default factory;",
        ].join("\n");

        const actual = ModuleCompiler.compile("x-component", "<span #show=\"host.show\"></span>", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public compileWithElementAndAttributesAndOneWayBindDirective(): void
    {
        const expected =
        [
            "import {",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tcreateOnewayFactory",
            "} from \"@surface/custom-element/factories\";",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"SPAN\",",
            "\t\t\t\tvoid 0,",
            "\t\t\t\t[",
            "\t\t\t\t\tcreateOnewayFactory",
            "\t\t\t\t\t(",
            "\t\t\t\t\t\t\"value\",",
            "\t\t\t\t\t\tscope => { with (scope) { return host.value; },",
            "\t\t\t\t\t\t[[\"host\",\"value\"]],",
            "\t\t\t\t\t\t\":value=\\\"host.value\\\"\",",
            "\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span :value=\\\"host.value\\\">\"]],",
            "\t\t\t\t\t)",
            "\t\t\t\t],",
            "\t\t\t)",
            "\t\t]",
            "\t);",
            "export default factory;",
        ].join("\n");

        const actual = ModuleCompiler.compile("x-component", "<span :value=\"host.value\"></span>", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public compileWithElementAndAttributesAndTwoWayBindDirective(): void
    {
        const expected =
        [
            "import {",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tcreateTwowayFactory",
            "} from \"@surface/custom-element/factories\";",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"SPAN\",",
            "\t\t\t\tvoid 0,",
            "\t\t\t\t[",
            "\t\t\t\t\tcreateTwowayFactory",
            "\t\t\t\t\t(",
            "\t\t\t\t\t\t\"value\",",
            "\t\t\t\t\t\t[\"host\",\"value\"],",
            "\t\t\t\t\t\t\"::value=\\\"host.value\\\"\",",
            "\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span ::value=\\\"host.value\\\">\"]],",
            "\t\t\t\t\t)",
            "\t\t\t\t],",
            "\t\t\t)",
            "\t\t]",
            "\t);",
            "export default factory;",
        ].join("\n");

        const actual = ModuleCompiler.compile("x-component", "<span ::value=\"host.value\"></span>", false);

        chai.assert.equal(actual, expected);
    }
}
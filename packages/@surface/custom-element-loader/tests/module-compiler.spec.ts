// import { writeFileSync }           from "fs";
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
            "\t\t\t\t\t\tscope => `${host.value}`,",
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
            "\t\t\t\t\t\tscope => host.handler,",
            "\t\t\t\t\t\tscope => host,",
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
            "\t\t\t\t\t\tscope => host.show,",
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
            "\t\t\t\t\t\tscope => host.value,",
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

    @test @shouldPass
    public compileWithConditionalDirective(): void
    {
        const expected =
        [
            "import {",
            "\tcreateFragmentFactory,",
            "\tcreateChoiceFactory,",
            "\tcreateElementFactory,",
            "\tcreateTextNodeFactory",
            "} from \"@surface/custom-element/factories\";",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateChoiceFactory",
            "\t\t\t(",
            "\t\t\t\t[",
            "\t\t\t\t\t{",
            "\t\t\t\t\t\texpression: scope => host.value,",
            "\t\t\t\t\t\tfragment:",
            "\t\t\t\t\t\t\tcreateFragmentFactory",
            "\t\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\t[",
            "\t\t\t\t\t\t\t\t\tcreateElementFactory",
            "\t\t\t\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\t\t\t\"SPAN\",",
            "\t\t\t\t\t\t\t\t\t\tvoid 0,",
            "\t\t\t\t\t\t\t\t\t\tvoid 0,",
            "\t\t\t\t\t\t\t\t\t\t[",
            "\t\t\t\t\t\t\t\t\t\t\tcreateTextNodeFactory(\"Show\")",
            "\t\t\t\t\t\t\t\t\t\t]",
            "\t\t\t\t\t\t\t\t\t)",
            "\t\t\t\t\t\t\t\t]",
            "\t\t\t\t\t\t\t),",
            "\t\t\t\t\t\tobservables: [[\"host\",\"value\"]],",
            "\t\t\t\t\t\tsource: \"#if=\\\"host.value\\\"\",",
            "\t\t\t\t\t\tstackTrace: [[\"<x-component>\"],[\"#shadow-root\"],[\"<span #if=\\\"host.value\\\">\"]],",
            "\t\t\t\t\t},",
            "\t\t\t\t\t{",
            "\t\t\t\t\t\texpression: scope => true,",
            "\t\t\t\t\t\tfragment:",
            "\t\t\t\t\t\t\tcreateFragmentFactory",
            "\t\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\t[",
            "\t\t\t\t\t\t\t\t\tcreateElementFactory",
            "\t\t\t\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\t\t\t\"SPAN\",",
            "\t\t\t\t\t\t\t\t\t\tvoid 0,",
            "\t\t\t\t\t\t\t\t\t\tvoid 0,",
            "\t\t\t\t\t\t\t\t\t\t[",
            "\t\t\t\t\t\t\t\t\t\t\tcreateTextNodeFactory(\"Hide\")",
            "\t\t\t\t\t\t\t\t\t\t]",
            "\t\t\t\t\t\t\t\t\t)",
            "\t\t\t\t\t\t\t\t]",
            "\t\t\t\t\t\t\t),",
            "\t\t\t\t\t\tobservables: [],",
            "\t\t\t\t\t\tsource: \"#else\",",
            "\t\t\t\t\t\tstackTrace: [[\"<x-component>\"],[\"#shadow-root\"],[\"...1 other(s) node(s)\",\"<span #else>\"]],",
            "\t\t\t\t\t},",
            "\t\t\t\t]",
            "\t\t\t)",
            "\t\t]",
            "\t);",
            "export default factory;",
        ].join("\n");

        const actual = ModuleCompiler.compile("x-component", "<span #if=\"host.value\">Show</span><span #else>Hide</span>", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public compileWithLoopDirective(): void
    {
        const expected =
        [
            "import {",
            "\tcreateFragmentFactory,",
            "\tcreateLoopFactory,",
            "\tcreateElementFactory,",
            "\tcreateTextNodeInterpolationFactory",
            "} from \"@surface/custom-element/factories\";",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateLoopFactory",
            "\t\t\t(",
            "\t\t\t\tscope => value,",
            "\t\t\t\t\"of\",",
            "\t\t\t\tscope => host.values,",
            "\t\t\t\t[[\"host\",\"values\"]],",
            "\t\t\t\tcreateFragmentFactory",
            "\t\t\t\t(",
            "\t\t\t\t\t[",
            "\t\t\t\t\t\tcreateElementFactory",
            "\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\"SPAN\",",
            "\t\t\t\t\t\t\tvoid 0,",
            "\t\t\t\t\t\t\tvoid 0,",
            "\t\t\t\t\t\t\t[",
            "\t\t\t\t\t\t\t\tcreateTextNodeInterpolationFactory",
            "\t\t\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\t\tscope => `Value: ${value}`,",
            "\t\t\t\t\t\t\t\t\t[],",
            "\t\t\t\t\t\t\t\t\t\"Value: {value}\",",
            "\t\t\t\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span #for=\\\"value of host.values\\\">\"],[\"Value: {value}\"]],",
            "\t\t\t\t\t\t\t\t)",
            "\t\t\t\t\t\t\t]",
            "\t\t\t\t\t\t)",
            "\t\t\t\t\t]",
            "\t\t\t\t),",
            "\t\t\t\t\"#for=\\\"value of host.values\\\"\",",
            "\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span #for=\\\"value of host.values\\\">\"]],",
            "\t\t\t)",
            "\t\t]",
            "\t);",
            "export default factory;",
        ].join("\n");

        const actual = ModuleCompiler.compile("x-component", "<span #for=\"value of host.values\">Value: {value}</span>", false);

        // writeFileSync("test.js", actual);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public compileWithPlaceholderDirective(): void
    {
        const expected =
        [
            "import {",
            "\tcreateFragmentFactory,",
            "\tcreatePlaceholderFactory,",
            "\tcreateElementFactory,",
            "\tcreateTextNodeInterpolationFactory",
            "} from \"@surface/custom-element/factories\";",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreatePlaceholderFactory",
            "\t\t\t(",
            "\t\t\t\tscope => \"default\",",
            "\t\t\t\tscope => { value: host.value },",
            "\t\t\t\t{\"key\":[],\"value\":[[\"host\",\"value\"]]},",
            "\t\t\t\tcreateFragmentFactory",
            "\t\t\t\t(",
            "\t\t\t\t\t[",
            "\t\t\t\t\t\tcreateElementFactory",
            "\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\"SPAN\",",
            "\t\t\t\t\t\t\tvoid 0,",
            "\t\t\t\t\t\t\tvoid 0,",
            "\t\t\t\t\t\t\t[",
            "\t\t\t\t\t\t\t\tcreateTextNodeInterpolationFactory",
            "\t\t\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\t\tscope => `Value: ${host.value}`,",
            "\t\t\t\t\t\t\t\t\t[[\"host\",\"value\"]],",
            "\t\t\t\t\t\t\t\t\t\"Value: {host.value}\",",
            "\t\t\t\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span #placeholder=\\\"{ value: host.value }\\\">\"],[\"Value: {host.value}\"]],",
            "\t\t\t\t\t\t\t\t)",
            "\t\t\t\t\t\t\t]",
            "\t\t\t\t\t\t)",
            "\t\t\t\t\t]",
            "\t\t\t\t),",
            "\t\t\t\t{\"key\":\"\",\"value\":\"#placeholder=\\\"{ value: host.value }\\\"\"},",
            "\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span #placeholder=\\\"{ value: host.value }\\\">\"]],",
            "\t\t\t)",
            "\t\t]",
            "\t);",
            "export default factory;",
        ].join("\n");

        const actual = ModuleCompiler.compile("x-component", "<span #placeholder=\"{ value: host.value }\">Value: {host.value}</span>", false);

        // writeFileSync("test.js", actual);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public compileWithInjectinDirective(): void
    {
        const expected =
        [
            "import {",
            "\tcreateFragmentFactory,",
            "\tcreateInjectionFactory,",
            "\tcreateElementFactory,",
            "\tcreateTextNodeInterpolationFactory",
            "} from \"@surface/custom-element/factories\";",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateInjectionFactory",
            "\t\t\t(",
            "\t\t\t\tscope => \"default\",",
            "\t\t\t\tscope => { value },",
            "\t\t\t\t{\"key\":[],\"value\":[]},",
            "\t\t\t\tcreateFragmentFactory",
            "\t\t\t\t(",
            "\t\t\t\t\t[",
            "\t\t\t\t\t\tcreateElementFactory",
            "\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\"SPAN\",",
            "\t\t\t\t\t\t\tvoid 0,",
            "\t\t\t\t\t\t\tvoid 0,",
            "\t\t\t\t\t\t\t[",
            "\t\t\t\t\t\t\t\tcreateTextNodeInterpolationFactory",
            "\t\t\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\t\tscope => `Value: ${value}`,",
            "\t\t\t\t\t\t\t\t\t[],",
            "\t\t\t\t\t\t\t\t\t\"Value: {value}\",",
            "\t\t\t\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span #inject=\\\"{ value }\\\">\"],[\"Value: {value}\"]],",
            "\t\t\t\t\t\t\t\t)",
            "\t\t\t\t\t\t\t]",
            "\t\t\t\t\t\t)",
            "\t\t\t\t\t]",
            "\t\t\t\t),",
            "\t\t\t\t{\"key\":\"\",\"value\":\"#inject=\\\"{ value }\\\"\"},",
            "\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span #inject=\\\"{ value }\\\">\"]],",
            "\t\t\t)",
            "\t\t]",
            "\t);",
            "export default factory;",
        ].join("\n");

        const actual = ModuleCompiler.compile("x-component", "<span #Inject=\"{ value }\">Value: {value}</span>", false);

        // writeFileSync("test.js", actual);

        chai.assert.equal(actual, expected);
    }
}
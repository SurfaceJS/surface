import { suite, test } from "@surface/test-suite";
import chai            from "chai";
import webpack         from "webpack";
import loader          from "../../internal/loaders/html-require-loader";

@suite
export default class HtmlImportLoaderSpec
{
    @test
    public load(): void
    {
        const source =
        [
            "export default ",
            "\"",
            "#import 'foo'\n",
            "#import 'bar'\n",
            "\\\\#import 'scaped'\n",
            "<tag/>\n",
            "<unclosed>\n",
            "#import \"should import\";\n",
            "<tag e='x > y'>\n",
            "#import 'ignore'\n",
            "</tag>\n",
            "#import 'another'\n",
            "<tag>\n",
            "empty\n",
            "</tag>\n",
            "Ignored #import 'ignored'\n",
            "<tag>\n",
            "empty\n",
            "</tag>\n",
            "#import 'another-again'",
            "\"",
        ].join("");

        const expected =
        [
            "import \"foo\";\n",
            "import \"bar\";\n",
            "export default ",
            "\"",
            "#import 'scaped'\n",
            "<tag/>\n",
            "<unclosed>\n",
            "#import \"should import\";\n",
            "<tag e='x > y'>\n",
            "#import 'ignore'\n",
            "</tag>\n",
            "#import 'another'\n",
            "<tag>\n",
            "empty\n",
            "</tag>\n",
            "Ignored #import 'ignored'\n",
            "<tag>\n",
            "empty\n",
            "</tag>\n",
            "#import 'another-again'",
            "\"",
        ].join("");

        const context = { cacheable: () => undefined } as webpack.loader.LoaderContext;

        const actual = loader.call(context, source);

        chai.expect(actual).to.equal(expected);
    }
}
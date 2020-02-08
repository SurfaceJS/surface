import "./fixtures/dom";

import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import ThemeProvider               from "../internal/theme-provider";
import materialColors              from "../material-colors";

@suite
export default class ColorSpec
{
    @test @shouldPass
    public use(): void
    {
        const provider = new ThemeProvider();

        provider.use({ primary: materialColors.indigo, secondary: materialColors.blue });

        assert.equal(1, 0);
    }
}
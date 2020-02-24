import "./fixtures/dom";

import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import materialColors              from "../internal/material-colors";
import ThemeProvider               from "../internal/theme-provider";

@suite
export default class ThemeProviderSpec
{
    @test @shouldPass
    public use(): void
    {
        const provider = new ThemeProvider();

        provider.use({ primary: materialColors.indigo, secondary: materialColors.blue });

        assert.equal(1, 0);
    }
}
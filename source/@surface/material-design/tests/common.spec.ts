import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import ITheme                      from "../interfaces/theme";
import { generateThemes }          from "../internal/common";

@suite
export default class ThemeGeneratorSpec
{
    @test @shouldPass
    public generateColorMap(): void
    {
        const raw: Partial<ITheme> = { primary: "#ff0000", secondary: "#00ff00" };

        // Todo
        const expected = { };

        const actual = generateThemes(raw);

        assert.deepEqual(actual, expected);
    }
}
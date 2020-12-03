/* eslint-disable sort-keys */
import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import { generateTheme }           from "../internal/common";

@suite
export default class ThemeGeneratorSpec
{
    @test @shouldPass
    public generateColorMap(): void
    {
        const raw = { light: { primary: "#ff0000", secondary: "#00ff00" } };

        const expected =
        {
            light:
            {
                primary:
                {
                    "50":   "#ffe1e1ff",
                    "100":  "#ffc3c3ff",
                    "200":  "#ffa5a5ff",
                    "300":  "#ff8787ff",
                    "400":  "#ff6969ff",
                    "500":  "#ff0000ff",
                    "600":  "#db0000ff",
                    "700":  "#b70000ff",
                    "800":  "#930000ff",
                    "900":  "#6f0000ff",
                    "A100": "#ff8787ff",
                    "A200": "#ff0000ff",
                    "A400": "#e00000ff",
                    "A700": "#ba0000ff",
                },
                secondary:
                {
                    "50":   "#e1ffe1ff",
                    "100":  "#c3ffc3ff",
                    "200":  "#a5ffa5ff",
                    "300":  "#87ff87ff",
                    "400":  "#69ff69ff",
                    "500":  "#00ff00ff",
                    "600":  "#00db00ff",
                    "700":  "#00b700ff",
                    "800":  "#009300ff",
                    "900":  "#006f00ff",
                    "A100": "#99ff87ff",
                    "A200": "#26ff00ff",
                    "A400": "#22e000ff",
                    "A700": "#1cba00ff",
                },
            },
        };

        const actual = generateTheme(raw);

        assert.deepEqual(actual, expected);
    }
}
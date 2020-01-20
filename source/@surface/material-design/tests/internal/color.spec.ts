import { shouldPass, suite, test }      from "@surface/test-suite";
import { assert }                       from "chai";
import { hslToRgb, rgbToHsl, rgbToHue } from "../../internal/color";

@suite
export default class ColorSpec
{
    @test @shouldPass
    public hslToRgb(): void
    {
        assert.deepEqual(hslToRgb({ h: 200, s: 0.6, l: 0.5 }), { r: 51,  g: 153, b: 204 });
        assert.deepEqual(hslToRgb({ h: 351, s:   1, l: 0.6 }), { r: 255, g: 51,  b: 82  });
        assert.deepEqual(hslToRgb({ h: 0,   s:   1, l: 0.5 }), { r: 255, g: 0,   b: 0   });
        assert.deepEqual(hslToRgb({ h: 30,  s:   1, l: 0.5 }), { r: 255, g: 128, b: 0   });
        assert.deepEqual(hslToRgb({ h: 90,  s:   1, l: 0.5 }), { r: 128, g: 255, b: 0   });
    }

    @test @shouldPass
    public rgbToHsl(): void
    {
        assert.deepEqual(rgbToHsl({ r: 51,  g: 153, b: 204 }), { h: 200, s: 0.6, l: 0.5 });
        assert.deepEqual(rgbToHsl({ r: 255, g: 51,  b: 82  }), { h: 351, s:   1, l: 0.6 });
        assert.deepEqual(rgbToHsl({ r: 255, g: 0,   b: 0   }), { h: 0,   s:   1, l: 0.5 });
        assert.deepEqual(rgbToHsl({ r: 255, g: 128, b: 0   }), { h: 30,  s:   1, l: 0.5 });
        assert.deepEqual(rgbToHsl({ r: 128, g: 255, b: 0   }), { h: 90,  s:   1, l: 0.5 });
    }

    @test @shouldPass
    public rgbToHue(): void
    {
        assert.equal(rgbToHue(51,  153, 204), 200);
        assert.equal(rgbToHue(255, 71,  99),  351);
        assert.equal(rgbToHue(255, 0,   0),   0);
        assert.equal(rgbToHue(255, 128, 0),   30);
        assert.equal(rgbToHue(124, 252, 0),   90);
    }
}
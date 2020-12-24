/* eslint-disable sort-keys */
import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import
{
    hexToHsla,
    hexToHsva,
    hexToRgba,
    hslaToHex,
    hslaToRgba,
    hsvaToHex,
    hsvaToRgba,
    labToXyz,
    rgbToXyz,
    rgbaToHex,
    rgbaToHsla,
    rgbaToHsva,
    xyzToLab,
    xyzToRgb,
} from "../internal/converters.js";

@suite
export default class ColorConvertersSpec
{
    @test @shouldPass
    public hexToRgba(): void
    {
        chai.assert.deepEqual(hexToRgba("#f44336ff"), { r: 244, g: 67, b: 54, a: 255 });
    }

    @test @shouldPass
    public rgbaToHex(): void
    {
        chai.assert.deepEqual(rgbaToHex({ r: 244, g: 67, b: 54, a: 255 }), "#f44336ff");
    }

    @test @shouldPass
    public hexToHsla(): void
    {
        chai.assert.deepEqual(hexToHsla("#f44336ff"), { h: 0.01140350877192986, s: 0.8962264150943399, l: 0.5843137254901961, a: 1 });
    }

    @test @shouldPass
    public hslaToHex(): void
    {
        chai.assert.deepEqual(hslaToHex({ h: 0.01140350877192986, s: 0.8962264150943399, l: 0.5843137254901961, a: 1 }), "#f44336ff");
    }

    @test @shouldPass
    public hexToHsva(): void
    {
        chai.assert.deepEqual(hexToHsva("#f44336"), { h: 0.01140350877192986, s: 0.7786885245901639, v: 0.9568627450980393, a: 1 });
    }

    @test @shouldPass
    public hsvaToHex(): void
    {
        chai.assert.deepEqual(hsvaToHex({ h: 0.01140350877192986, s: 0.7786885245901639, v: 0.9568627450980393, a: 1 }), "#f44336ff");
    }

    @test @shouldPass
    public rgbaToHsla(): void
    {
        chai.assert.deepEqual(rgbaToHsla({ r: 51,  g: 153, b: 204, a: 255 }), { h: 0.5555555555555556,  s: 0.6000000000000001, l: 0.5, a: 1 });
        chai.assert.deepEqual(rgbaToHsla({ r: 255, g: 51,  b: 82,  a: 255 }), { h: 0.9746732026143792,  s: 1,                  l: 0.6, a: 1 });
        chai.assert.deepEqual(rgbaToHsla({ r: 255, g: 0,   b: 0,   a: 255 }), { h: 0,                   s: 1,                  l: 0.5, a: 1 });
        chai.assert.deepEqual(rgbaToHsla({ r: 255, g: 128, b: 0,   a: 255 }), { h: 0.08366013071895417, s: 1,                  l: 0.5, a: 1 });
        chai.assert.deepEqual(rgbaToHsla({ r: 128, g: 255, b: 0,   a: 255 }), { h: 0.2496732026143792,  s: 1,                  l: 0.5, a: 1 });
    }

    @test @shouldPass
    public hslaToRgba(): void
    {
        chai.assert.deepEqual(hslaToRgba({ h: 0.5555555555555556,  s: 0.6000000000000001, l: 0.5, a: 1 }), { r:  51, g: 153, b: 204, a: 255 });
        chai.assert.deepEqual(hslaToRgba({ h: 0.9746732026143792,  s: 1,                  l: 0.6, a: 1 }), { r: 255, g: 51,  b: 82,  a: 255 });
        chai.assert.deepEqual(hslaToRgba({ h: 0,                   s: 1,                  l: 0.5, a: 1 }), { r: 255, g: 0,   b: 0,   a: 255 });
        chai.assert.deepEqual(hslaToRgba({ h: 0.08366013071895417, s: 1,                  l: 0.5, a: 1 }), { r: 255, g: 128, b: 0,   a: 255 });
        chai.assert.deepEqual(hslaToRgba({ h: 0.2496732026143792,  s: 1,                  l: 0.5, a: 1 }), { r: 128, g: 255, b: 0,   a: 255 });
    }

    @test @shouldPass
    public rgbaToHsva(): void
    {
        chai.assert.deepEqual(rgbaToHsva({ r: 51,  g: 153, b: 204, a: 255 }), { h: 0.5555555555555556,  s: 0.7500000000000001, v: 0.8, a: 1 });
        chai.assert.deepEqual(rgbaToHsva({ r: 255, g: 51,  b: 82,  a: 255 }), { h: 0.9746732026143792,  s: 0.8,                v: 1,   a: 1 });
        chai.assert.deepEqual(rgbaToHsva({ r: 255, g: 0,   b: 0,   a: 255 }), { h: 0,                   s: 1,                  v: 1,   a: 1 });
        chai.assert.deepEqual(rgbaToHsva({ r: 255, g: 128, b: 0,   a: 255 }), { h: 0.08366013071895417, s: 1,                  v: 1,   a: 1 });
        chai.assert.deepEqual(rgbaToHsva({ r: 128, g: 255, b: 0,   a: 255 }), { h: 0.2496732026143792,  s: 1,                  v: 1,   a: 1 });
    }

    @test @shouldPass
    public hsvaToRgba(): void
    {
        chai.assert.deepEqual(hsvaToRgba({ h: 0.5555555555555556,  s: 0.7500000000000001, v: 0.8, a: 1 }), { r:  51, g: 153, b: 204, a: 255 });
        chai.assert.deepEqual(hsvaToRgba({ h: 0.9746732026143792,  s: 0.8,                v: 1,   a: 1 }), { r: 255, g: 51,  b: 82,  a: 255 });
        chai.assert.deepEqual(hsvaToRgba({ h: 0,                   s: 1,                  v: 1,   a: 1 }), { r: 255, g: 0,   b: 0,   a: 255 });
        chai.assert.deepEqual(hsvaToRgba({ h: 0.08366013071895417, s: 1,                  v: 1,   a: 1 }), { r: 255, g: 128, b: 0,   a: 255 });
        chai.assert.deepEqual(hsvaToRgba({ h: 0.2496732026143792,  s: 1,                  v: 1,   a: 1 }), { r: 128, g: 255, b: 0,   a: 255 });
    }

    @test @shouldPass
    public rgbToXyz(): void
    {
        chai.assert.deepEqual(rgbToXyz({ r: 51,  g: 153, b: 204 }), { x: 23.65555682547543,  y: 27.84590629533912,  z: 61.25475835293276  });
        chai.assert.deepEqual(rgbToXyz({ r: 255, g: 51,  b: 82  }), { x: 43.946817070946736, y: 24.236849152498458, z: 10.344567724796295 });
        chai.assert.deepEqual(rgbToXyz({ r: 255, g: 0,   b: 0   }), { x: 41.24,              y: 21.26,              z: 1.9300000000000002 });
        chai.assert.deepEqual(rgbToXyz({ r: 255, g: 128, b: 0   }), { x: 48.95917148407304,  y: 36.69834296814607,  z: 4.503057161357679  });
        chai.assert.deepEqual(rgbToXyz({ r: 128, g: 255, b: 0   }), { x: 44.6620870246972,   y: 76.10919423242149,  z: 12.336610765219826 });
    }

    @test @shouldPass
    public xyzToRgb(): void
    {
        chai.assert.deepEqual(xyzToRgb({ x: 23.65555682547543,  y: 27.84590629533912,  z: 61.25475835293276  }), { r: 51,  g: 153, b: 204 });
        chai.assert.deepEqual(xyzToRgb({ x: 43.946817070946736, y: 24.236849152498458, z: 10.344567724796295 }), { r: 255, g: 51,  b: 82  });
        chai.assert.deepEqual(xyzToRgb({ x: 41.24,              y: 21.26,              z: 1.9300000000000002 }), { r: 255, g: 0,   b: 0   });
        chai.assert.deepEqual(xyzToRgb({ x: 48.95917148407304,  y: 36.69834296814607,  z: 4.503057161357679  }), { r: 255, g: 128, b: 0   });
        chai.assert.deepEqual(xyzToRgb({ x: 44.6620870246972,   y: 76.10919423242149,  z: 12.336610765219826 }), { r: 128, g: 255, b: 0   });
    }

    @test @shouldPass
    public xyzToLab(): void
    {
        chai.assert.deepEqual(xyzToLab({ x: 23.655556825475433, y: 27.84590629533912,  z: 61.25475835293276  }), { l: 59.749268221692404, a: -11.99512879365322, b: -34.50142745832172 });
        chai.assert.deepEqual(xyzToLab({ x: 43.946817070946736, y: 24.23684915249846,  z: 10.3445677247963   }), { l: 56.32415626240437,  a: 74.89162002243904,  b: 33.43676071786996  });
        chai.assert.deepEqual(xyzToLab({ x: 41.24,              y: 21.260000000000005, z: 1.930000000000001  }), { l: 53.23288178584245,  a: 80.10930952982204,  b: 67.22006831026425  });
        chai.assert.deepEqual(xyzToLab({ x: 48.959171484073046, y: 36.69834296814608,  z: 4.503057161357677  }), { l: 67.05009640622828,  a: 42.83237449456267,  b: 74.02597734124544  });
        chai.assert.deepEqual(xyzToLab({ x: 44.66208702469722,  y: 76.10919423242153,  z: 12.336610765219838 }), { l: 89.91001525477147,  a: -67.788699970255,   b: 85.8257833749496   });
    }

    @test @shouldPass
    public labToXyz(): void
    {
        chai.assert.deepEqual(labToXyz({ l: 59.749268221692404, a: -11.99512879365322, b: -34.50142745832172 }), { x: 23.655556825475433, y: 27.84590629533912,  z: 61.25475835293276 });
        chai.assert.deepEqual(labToXyz({ l: 56.32415626240437,  a: 74.89162002243904,  b: 33.43676071786996  }), { x: 43.946817070946736, y: 24.23684915249846,  z: 10.3445677247963  });
        chai.assert.deepEqual(labToXyz({ l: 53.23288178584245,  a: 80.10930952982204,  b: 67.22006831026425  }), { x: 41.24,              y: 21.260000000000005, z: 1.930000000000001 });
        chai.assert.deepEqual(labToXyz({ l: 67.05009640622828,  a: 42.83237449456267,  b: 74.02597734124544  }), { x: 48.959171484073046, y: 36.69834296814608,  z: 4.503057161357677  });
        chai.assert.deepEqual(labToXyz({ l: 89.91001525477147,  a: -67.788699970255,   b: 85.8257833749496   }), { x: 44.66208702469722,  y: 76.10919423242153,  z: 12.336610765219838 });
    }
}
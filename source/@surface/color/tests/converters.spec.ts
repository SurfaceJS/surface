import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import
{
    hexToHsl,
    hexToHsv,
    hexToRgb,
    hslToHex,
    hslToRgb,
    hsvToHex,
    hsvToRgb,
    labToXyz,
    rgbToHex,
    rgbToHsl,
    rgbToHsv,
    rgbToXyz,
    xyzToLab,
    xyzToRgb
}
from "../internal/converters";

@suite
export default class ColorConvertersSpec
{
    @test @shouldPass
    public hexToRgb(): void
    {
        assert.deepEqual(hexToRgb("#f44336"), { r: 244, g: 67, b: 54 });
    }

    @test @shouldPass
    public rgbToHex(): void
    {
        assert.deepEqual(rgbToHex({ r: 244, g: 67, b: 54 }), "#f44336");
    }

    @test @shouldPass
    public hexToHsl(): void
    {
        assert.deepEqual(hexToHsl("#f44336"), { h: 0.01140350877192986, s: 0.8962264150943399, l: 0.5843137254901961 });
    }

    @test @shouldPass
    public hslToHex(): void
    {
        assert.deepEqual(hslToHex({ h: 0.01140350877192986, s: 0.8962264150943399, l: 0.5843137254901961 }), "#f44336");
    }

    @test @shouldPass
    public hexToHsv(): void
    {
        assert.deepEqual(hexToHsv("#f44336"), { h: 0.01140350877192986, s: 0.7786885245901639, v: 0.9568627450980393 });
    }

    @test @shouldPass
    public hsvToHex(): void
    {
        assert.deepEqual(hsvToHex({ h: 0.01140350877192986, s: 0.7786885245901639, v: 0.9568627450980393 }), "#f44336");
    }

    @test @shouldPass
    public rgbToHsl(): void
    {
        assert.deepEqual(rgbToHsl({ r: 51,  g: 153, b: 204 }), { h: 0.5555555555555556,  s: 0.6000000000000001, l: 0.5 });
        assert.deepEqual(rgbToHsl({ r: 255, g: 51,  b: 82  }), { h: 0.9746732026143792,  s: 1,                  l: 0.6 });
        assert.deepEqual(rgbToHsl({ r: 255, g: 0,   b: 0   }), { h: 0,                   s: 1,                  l: 0.5 });
        assert.deepEqual(rgbToHsl({ r: 255, g: 128, b: 0   }), { h: 0.08366013071895417, s: 1,                  l: 0.5 });
        assert.deepEqual(rgbToHsl({ r: 128, g: 255, b: 0   }), { h: 0.2496732026143792,  s: 1,                  l: 0.5 });
    }

    @test @shouldPass
    public hslToRgb(): void
    {
        assert.deepEqual(hslToRgb({ h: 0.5555555555555556,  s: 0.6000000000000001, l: 0.5 }), { r:  51, g: 153, b: 204 });
        assert.deepEqual(hslToRgb({ h: 0.9746732026143792,  s: 1,                  l: 0.6 }), { r: 255, g: 51,  b: 82  });
        assert.deepEqual(hslToRgb({ h: 0,                   s: 1,                  l: 0.5 }), { r: 255, g: 0,   b: 0   });
        assert.deepEqual(hslToRgb({ h: 0.08366013071895417, s: 1,                  l: 0.5 }), { r: 255, g: 128, b: 0   });
        assert.deepEqual(hslToRgb({ h: 0.2496732026143792,  s: 1,                  l: 0.5 }), { r: 128, g: 255, b: 0   });
    }

    @test @shouldPass
    public rgbToHsv(): void
    {
        assert.deepEqual(rgbToHsv({ r: 51,  g: 153, b: 204 }), { h: 0.5555555555555556,  s: 0.7500000000000001, v: 0.8 });
        assert.deepEqual(rgbToHsv({ r: 255, g: 51,  b: 82  }), { h: 0.9746732026143792,  s: 0.8,                v: 1   });
        assert.deepEqual(rgbToHsv({ r: 255, g: 0,   b: 0   }), { h: 0,                   s: 1,                  v: 1   });
        assert.deepEqual(rgbToHsv({ r: 255, g: 128, b: 0   }), { h: 0.08366013071895417, s: 1,                  v: 1   });
        assert.deepEqual(rgbToHsv({ r: 128, g: 255, b: 0   }), { h: 0.2496732026143792,  s: 1,                  v: 1   });
    }

    @test @shouldPass
    public hsvToRgb(): void
    {
        assert.deepEqual(hsvToRgb({ h: 0.5555555555555556,  s: 0.7500000000000001, v: 0.8 }), { r:  51, g: 153, b: 204 });
        assert.deepEqual(hsvToRgb({ h: 0.9746732026143792,  s: 0.8,                v: 1   }), { r: 255, g: 51,  b: 82  });
        assert.deepEqual(hsvToRgb({ h: 0,                   s: 1,                  v: 1   }), { r: 255, g: 0,   b: 0   });
        assert.deepEqual(hsvToRgb({ h: 0.08366013071895417, s: 1,                  v: 1   }), { r: 255, g: 128, b: 0   });
        assert.deepEqual(hsvToRgb({ h: 0.2496732026143792,  s: 1,                  v: 1   }), { r: 128, g: 255, b: 0   });
    }

    @test @shouldPass
    public rgbToXyz(): void
    {
        assert.deepEqual(rgbToXyz({ r: 51,  g: 153, b: 204 }), { x: 23.65555682547543,  y: 27.84590629533912,  z: 61.25475835293276  });
        assert.deepEqual(rgbToXyz({ r: 255, g: 51,  b: 82  }), { x: 43.946817070946736, y: 24.236849152498458, z: 10.344567724796295 });
        assert.deepEqual(rgbToXyz({ r: 255, g: 0,   b: 0   }), { x: 41.24,              y: 21.26,              z: 1.9300000000000002 });
        assert.deepEqual(rgbToXyz({ r: 255, g: 128, b: 0   }), { x: 48.95917148407304,  y: 36.69834296814607,  z: 4.503057161357679  });
        assert.deepEqual(rgbToXyz({ r: 128, g: 255, b: 0   }), { x: 44.6620870246972,   y: 76.10919423242149,  z: 12.336610765219826 });
    }

    @test @shouldPass
    public xyzToRgb(): void
    {
        assert.deepEqual(xyzToRgb({ x: 23.65555682547543,  y: 27.84590629533912,  z: 61.25475835293276  }), { r: 51,  g: 153, b: 204 });
        assert.deepEqual(xyzToRgb({ x: 43.946817070946736, y: 24.236849152498458, z: 10.344567724796295 }), { r: 255, g: 51,  b: 82  });
        assert.deepEqual(xyzToRgb({ x: 41.24,              y: 21.26,              z: 1.9300000000000002 }), { r: 255, g: 0,   b: 0   });
        assert.deepEqual(xyzToRgb({ x: 48.95917148407304,  y: 36.69834296814607,  z: 4.503057161357679  }), { r: 255, g: 128, b: 0   });
        assert.deepEqual(xyzToRgb({ x: 44.6620870246972,   y: 76.10919423242149,  z: 12.336610765219826 }), { r: 128, g: 255, b: 0   });
    }

    @test @shouldPass
    public xyzToLab(): void
    {
        assert.deepEqual(xyzToLab({ x: 23.655556825475433, y: 27.84590629533912,  z: 61.25475835293276  }), { l: 59.749268221692404, a: -11.99512879365322, b: -34.50142745832172 });
        assert.deepEqual(xyzToLab({ x: 43.946817070946736, y: 24.23684915249846,  z: 10.3445677247963   }), { l: 56.32415626240437,  a: 74.89162002243904,  b: 33.43676071786996  });
        assert.deepEqual(xyzToLab({ x: 41.24,              y: 21.260000000000005, z: 1.930000000000001  }), { l: 53.23288178584245,  a: 80.10930952982204,  b: 67.22006831026425  });
        assert.deepEqual(xyzToLab({ x: 48.959171484073046, y: 36.69834296814608,  z: 4.503057161357677  }), { l: 67.05009640622828,  a: 42.83237449456267,  b: 74.02597734124544  });
        assert.deepEqual(xyzToLab({ x: 44.66208702469722,  y: 76.10919423242153,  z: 12.336610765219838 }), { l: 89.91001525477147,  a: -67.788699970255,   b: 85.8257833749496   });
    }

    @test @shouldPass
    public labToXyz(): void
    {
        assert.deepEqual(labToXyz({ l: 59.749268221692404, a: -11.99512879365322, b: -34.50142745832172 }), { x: 23.655556825475433, y: 27.84590629533912,  z: 61.25475835293276 });
        assert.deepEqual(labToXyz({ l: 56.32415626240437,  a: 74.89162002243904,  b: 33.43676071786996  }), { x: 43.946817070946736, y: 24.23684915249846,  z: 10.3445677247963  });
        assert.deepEqual(labToXyz({ l: 53.23288178584245,  a: 80.10930952982204,  b: 67.22006831026425  }), { x: 41.24,              y: 21.260000000000005, z: 1.930000000000001 });
        assert.deepEqual(labToXyz({ l: 67.05009640622828,  a: 42.83237449456267,  b: 74.02597734124544  }), { x: 48.959171484073046, y: 36.69834296814608,  z: 4.503057161357677  });
        assert.deepEqual(labToXyz({ l: 89.91001525477147,  a: -67.788699970255,   b: 85.8257833749496   }), { x: 44.66208702469722,  y: 76.10919423242153,  z: 12.336610765219838 });
    }
}
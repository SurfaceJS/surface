import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import
{
    cielabToXyz,
    hslToRgb,
    rgbToHsl,
    rgbToXyz,
    xyzToCielab,
    xyzToRgb
}
from "../../internal/color-converters";

@suite
export default class ColorConvertersSpec
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
    public rgbToXyz(): void
    {
        assert.deepEqual(rgbToXyz({ r: 51,  g: 153, b: 204 }), { x: 23.656, y: 27.846, z: 61.255 });
        assert.deepEqual(rgbToXyz({ r: 255, g: 51,  b: 82  }), { x: 43.947, y: 24.237, z: 10.345 });
        assert.deepEqual(rgbToXyz({ r: 255, g: 0,   b: 0   }), { x: 41.24,  y: 21.26,  z: 1.93   });
        assert.deepEqual(rgbToXyz({ r: 255, g: 128, b: 0   }), { x: 48.959, y: 36.698, z: 4.503  });
        assert.deepEqual(rgbToXyz({ r: 128, g: 255, b: 0   }), { x: 44.662, y: 76.109, z: 12.337 });
    }

    @test @shouldPass
    public xyzToRgb(): void
    {
        assert.deepEqual(xyzToRgb({ x: 23.656, y: 27.846, z: 61.255 }), { r: 51,  g: 153, b: 204 });
        assert.deepEqual(xyzToRgb({ x: 43.947, y: 24.237, z: 10.345 }), { r: 255, g: 51,  b: 82  });
        assert.deepEqual(xyzToRgb({ x: 41.24,  y: 21.26,  z: 1.93 }),   { r: 255, g: 0,   b: 0   });
        assert.deepEqual(xyzToRgb({ x: 48.959, y: 36.698, z: 4.503 }),  { r: 255, g: 128, b: 0   });
        assert.deepEqual(xyzToRgb({ x: 44.662, y: 76.109, z: 12.337 }), { r: 128, g: 255, b: 0   });
    }

    @test @shouldPass
    public xyzToCielab(): void
    {
        assert.deepEqual(xyzToCielab({ x: 23.656, y: 27.846, z: 61.255 }), { l: 59.7494, a: -11.9935, b: -34.5015 });
        assert.deepEqual(xyzToCielab({ x: 43.947, y: 24.237, z: 10.345 }), { l: 56.3243, a: 74.8915,  b: 33.4357  });
        assert.deepEqual(xyzToCielab({ x: 41.24,  y: 21.26,  z: 1.93   }), { l: 53.2329, a: 80.1093,  b: 67.2201  });
        assert.deepEqual(xyzToCielab({ x: 48.959, y: 36.698, z: 4.503  }), { l: 67.0498, a: 42.833,   b: 74.0258  });
        assert.deepEqual(xyzToCielab({ x: 44.662, y: 76.109, z: 12.337 }), { l: 89.9099, a: -67.7886, b: 85.8246  });
    }

    @test @shouldPass
    public cielabToXyz(): void
    {
        assert.deepEqual(cielabToXyz({ l: 59.7494, a: -11.9935, b: -34.5015 }), { x: 23.656, y: 27.846, z: 61.255 });
        assert.deepEqual(cielabToXyz({ l: 56.3243, a: 74.8915,  b: 33.4357  }), { x: 43.947, y: 24.237, z: 10.345 });
        assert.deepEqual(cielabToXyz({ l: 53.2329, a: 80.1093,  b: 67.2201  }), { x: 41.24,  y: 21.26,  z: 1.93   });
        assert.deepEqual(cielabToXyz({ l: 67.0498, a: 42.833,   b: 74.0258  }), { x: 48.959, y: 36.698, z: 4.503  });
        assert.deepEqual(cielabToXyz({ l: 89.9099, a: -67.7886, b: 85.8246  }), { x: 44.662, y: 76.109, z: 12.337 });
    }
}
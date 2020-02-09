import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import Polygon                     from "../polygon";
import Vector3                     from "../vector-3";

@suite
export default class PolygonSpec
{
    @test @shouldPass
    public scale(): void
    {
        const actualVertices =
        [
            new Vector3(0, 0, 0),
            new Vector3(1, 0, 0),
            new Vector3(1, 1, 0),
            new Vector3(0, 1, 0),
        ];

        const expectedVertices =
        [
            new Vector3(0.1, 0.25, 0.45),
            new Vector3(0.6000000000000001, 0.25, 0.45000000000000007),
            new Vector3(0.6000000000000001, 0.75, 0.45000000000000007),
            new Vector3(0.1, 0.75, 0.45),
        ];

        const poligon  = new Polygon(actualVertices);
        const expected = new Polygon(expectedVertices);

        const actual = Polygon.scale(poligon, new Vector3(0.2, 0.5, 0.9), 0.5);

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public tranlate(): void
    {
        const actualVertices =
        [
            new Vector3(0, 0, 0),
            new Vector3(1, 0, 0),
            new Vector3(1, 1, 0),
            new Vector3(0, 1, 0),
        ];

        const expectedVertices =
        [
            new Vector3(0.2, 0.5, 0.9),
            new Vector3(1.2, 0.5, 0.9),
            new Vector3(1.2, 1.5, 0.9),
            new Vector3(0.2, 1.5, 0.9),
        ];

        const poligon  = new Polygon(actualVertices);
        const expected = new Polygon(expectedVertices);

        const actual = Polygon.translate(poligon, new Vector3(0.2, 0.5, 0.9));

        assert.deepEqual(actual, expected);
    }
}
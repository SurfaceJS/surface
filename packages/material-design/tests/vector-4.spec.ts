import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import Vector4                     from "../internal/colors/vector-4.js";

@suite
export default class Vector4Spec
{
    @test @shouldPass
    public length(): void
    {
        const vector = new Vector4(1, 1, 1, 1);

        chai.assert.equal(vector.magnitude, 2);
    }

    @test @shouldPass
    public normalized(): void
    {
        const vector = new Vector4(0.5, 0.5, 0, 0);

        chai.assert.deepEqual(vector.normalized, new Vector4(0.7071067811865475, 0.7071067811865475, 0, 0));
    }

    @test @shouldPass
    public add(): void
    {
        const vectorA = new Vector4(1, 2, 3, 1);
        const vectorB = new Vector4(3, 2, 1, 1);

        chai.assert.deepEqual(Vector4.add(vectorA, vectorB), new Vector4(4, 4, 4, 2));
    }

    @test @shouldPass
    public subtract(): void
    {
        const vectorA = new Vector4(1, 2, 3, 1);
        const vectorB = new Vector4(3, 2, 1, 1);

        chai.assert.deepEqual(Vector4.subtract(vectorA, vectorB), new Vector4(-2, 0, 2, 0));
    }

    @test @shouldPass
    public multiply(): void
    {
        const vectorA = new Vector4(1, 2, 3, 1);

        chai.assert.deepEqual(Vector4.multiply(vectorA, 0.5), new Vector4(0.5, 1, 1.5, 0.5));
    }

    @test @shouldPass
    public divide(): void
    {
        const vectorA = new Vector4(1, 2, 3, 1);

        chai.assert.deepEqual(Vector4.divide(vectorA, 2), new Vector4(0.5, 1, 1.5, 0.5));
    }

    @test @shouldPass
    public equals(): void
    {
        const vectorA = new Vector4();
        const vectorB = new Vector4();

        chai.assert.deepEqual(Vector4.equals(vectorA, vectorB), true);
    }

    @test @shouldPass
    public dot(): void
    {
        const vectorA = new Vector4(1, 2, 3, 1);
        const vectorB = new Vector4(1, 2, 3, 1);

        chai.assert.deepEqual(Vector4.dot(vectorA, vectorB), 15);
    }
}

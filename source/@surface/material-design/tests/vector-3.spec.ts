import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import Vector3                     from "../internal/colors/vector-3.js";

@suite
export default class Vector3Spec
{
    @test @shouldPass
    public lenght(): void
    {
        const vector = new Vector3(1, 1, 1);

        chai.assert.equal(vector.magnitude, 1.7320508075688772);
    }

    @test @shouldPass
    public normalized(): void
    {
        const vector = new Vector3(0.5, 0.5, 0);

        chai.assert.deepEqual(vector.normalized, new Vector3(0.7071067811865475, 0.7071067811865475, 0));
    }

    @test @shouldPass
    public add(): void
    {
        const vectorA = new Vector3(1, 2, 3);
        const vectorB = new Vector3(3, 2, 1);

        chai.assert.deepEqual(Vector3.add(vectorA, vectorB), new Vector3(4, 4, 4));
    }

    @test @shouldPass
    public subtract(): void
    {
        const vectorA = new Vector3(1, 2, 3);
        const vectorB = new Vector3(3, 2, 1);

        chai.assert.deepEqual(Vector3.subtract(vectorA, vectorB), new Vector3(-2, 0, 2));
    }

    @test @shouldPass
    public multiply(): void
    {
        const vectorA = new Vector3(1, 2, 3);

        chai.assert.deepEqual(Vector3.multiply(vectorA, 0.5), new Vector3(0.5, 1, 1.5));
    }

    @test @shouldPass
    public divide(): void
    {
        const vectorA = new Vector3(1, 2, 3);

        chai.assert.deepEqual(Vector3.divide(vectorA, 2), new Vector3(0.5, 1, 1.5));
    }

    @test @shouldPass
    public equals(): void
    {
        const vectorA = new Vector3();
        const vectorB = new Vector3();

        chai.assert.deepEqual(Vector3.equals(vectorA, vectorB), true);
    }

    @test @shouldPass
    public dot(): void
    {
        const vectorA = new Vector3(1, 2, 3);
        const vectorB = new Vector3(1, 2, 3);

        chai.assert.deepEqual(Vector3.dot(vectorA, vectorB), 14);
    }

    @test @shouldPass
    public cross(): void
    {
        const vectorA = new Vector3(1, 0, 0);
        const vectorB = new Vector3(0, 1, 0);

        chai.assert.deepEqual(Vector3.cross(vectorA, vectorB), new Vector3(0, 0, 1));
    }
}
export default class Vector4
{
    public w: number;
    public x: number;
    public y: number;
    public z: number;

    public get magnitude(): number
    {
        return Math.sqrt(this.sqrMagnitude);
    }

    public get normalized(): Vector4
    {
        return Vector4.normalize(this);
    }

    public get sqrMagnitude(): number
    {
        return this.x ** 2 + this.y ** 2 + this.z ** 2 + this.w ** 2;
    }

    public constructor()
    public constructor(x: number, y: number, z: number, w: number)
    public constructor(x?: number, y?: number, z?: number, w?: number)
    {
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.z = z ?? 0;
        this.w = w ?? 0;
    }

    public static add(vectorA: Vector4, vectorB: Vector4): Vector4
    {
        return new Vector4(vectorA.x + vectorB.x, vectorA.y + vectorB.y, vectorA.z + vectorB.z, vectorA.w + vectorB.w);
    }

    public static dot(vectorA: Vector4, vectorB: Vector4): number
    {
        return vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z + vectorA.w * vectorB.w;
    }

    public static divide(vector: Vector4, scalar: number): Vector4
    {
        if (scalar == 0)
        {
            return new Vector4();
        }

        return Vector4.multiply(vector, 1.0 / scalar);
    }

    public static equals(vectorA: Vector4, vectorB: Vector4): boolean
    {
        return vectorA.x == vectorB.x && vectorA.y == vectorB.y && vectorA.z == vectorB.z && vectorA.w == vectorB.w;
    }

    public static multiply(vector: Vector4, scalar: number): Vector4
    {
        return new Vector4(vector.x * scalar, vector.y * scalar, vector.z * scalar, vector.w * scalar);
    }

    public static normalize(vector: Vector4): Vector4
    {
        return Vector4.divide(vector, vector.magnitude);
    }

    public static subtract(vectorA: Vector4, vectorB: Vector4): Vector4
    {
        return new Vector4(vectorA.x - vectorB.x, vectorA.y - vectorB.y, vectorA.z - vectorB.z, vectorA.w - vectorB.w);
    }
}
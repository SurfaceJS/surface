export default class Vector3
{
    public x: number;
    public y: number;
    public z: number;

    public get magnitude(): number
    {
        return Math.sqrt((this.x ** 2) + (this.y ** 2) + (this.z ** 2));
    }

    public get normalized(): Vector3
    {
        return Vector3.normalize(this);
    }

    public get sqrMagnitude(): number
    {
        return (this.x ** 2) + (this.y ** 2) + (this.z ** 2);
    }

    public constructor()
    public constructor(x: number, y: number, z: number)
    public constructor(x?: number, y?: number, z?: number)
    {
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.z = z ?? 0;
    }

    public static add(vectorA: Vector3, vectorB: Vector3): Vector3
	{
		return new Vector3(vectorA.x + vectorB.x, vectorA.y + vectorB.y, vectorA.z + vectorB.z);
    }

    public static dot(vectorA: Vector3, vectorB: Vector3): number
	{
        return vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z;
    }

    public static cross(vectorA: Vector3, vectorB: Vector3): Vector3
	{
        return new Vector3
        (
            vectorA.y * vectorB.z - vectorA.z * vectorB.y,
            vectorA.z * vectorB.x - vectorA.x * vectorB.z,
            vectorA.x * vectorB.y - vectorA.y * vectorB.x
        );
    }

    public static divide(vector: Vector3, scalar: number): Vector3
    {
        if (scalar == 0)
        {
            return new Vector3();
        }

        return Vector3.multiply(vector, 1.0 / scalar);
    }

    public static equals(vectorA: Vector3, vectorB: Vector3): boolean
    {
        return vectorA.x == vectorB.x && vectorA.y == vectorB.y && vectorA.z == vectorB.z;
    }

    public static multiply(vector: Vector3, scalar: number): Vector3
    {
        return new Vector3(vector.x * scalar, vector.y * scalar, vector.z * scalar);
    }

    public static normalize(vector: Vector3): Vector3
    {
        return Vector3.divide(vector, vector.magnitude);
    }

    public static subtract(vectorA: Vector3, vectorB: Vector3): Vector3
	{
		return new Vector3(vectorA.x - vectorB.x, vectorA.y - vectorB.y, vectorA.z - vectorB.z);
	}
}
import Vector3 from "./vector-3.js";

export default class Polygon
{
    public readonly vertices: Vector3[];

    public constructor (vertices?: Vector3[])
    {
        this.vertices = vertices ?? [];
    }

    public static scale(polygon: Polygon, origin: Vector3, factor: number): Polygon
    {
        const vertices: Vector3[] = [];

        for (const vertex of polygon.vertices)
        {
            const direction  = Vector3.subtract(vertex, origin);
            const distance   = direction.magnitude * factor;
            const normalized = direction.normalized;

            vertices.push(Vector3.add(origin, Vector3.multiply(normalized, distance)));
        }

        return new Polygon(vertices);
    }

    public static translate(polygon: Polygon, offset: Vector3): Polygon
    {
        const vertices: Vector3[] = [];

        for (const vertex of polygon.vertices)
        {
            vertices.push(Vector3.add(vertex, offset));
        }

        return new Polygon(vertices);
    }
}

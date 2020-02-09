import Vector3 from "./vector-3";

export default class Polygon
{
    public readonly vertices: Array<Vector3>;

    public constructor (vertices?: Array<Vector3>)
    {
        this.vertices = vertices ?? [];
    }

    public static scale(poligon: Polygon, origin: Vector3, factor: number): Polygon
    {
        const vertices: Array<Vector3> = [];

        for (const vertice of poligon.vertices)
        {
            const direction  = Vector3.subtract(vertice, origin);
            const distance   = direction.magnitude * factor;
            const normalized = direction.normalized;

            vertices.push(Vector3.add(origin, Vector3.multiply(normalized, distance)));
        }

        return new Polygon(vertices);
    }

    public static translate(poligon: Polygon, offset: Vector3): Polygon
    {
        const vertices: Array<Vector3> = [];

        for (const vertice of poligon.vertices)
        {
            vertices.push(Vector3.add(vertice, offset));
        }

        return new Polygon(vertices);
    }
}
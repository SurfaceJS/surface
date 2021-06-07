export default interface ITransformer
{
    parse(value: string): unknown;
    stringfy(value: unknown): string;
}
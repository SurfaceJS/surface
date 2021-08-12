export default interface ITransformer
{
    parse(value: string): unknown;
    stringify(value: unknown): string;
}
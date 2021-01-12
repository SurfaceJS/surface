export default interface ITransformer
{
    parse(source: string): Object;
    stringfy(object: Object): string;
}
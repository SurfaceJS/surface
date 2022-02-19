declare module "libnpmpack"
{
    export default async function pack(target: string): Promise<Buffer>;
}
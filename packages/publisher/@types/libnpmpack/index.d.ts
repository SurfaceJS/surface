declare module "libnpmpack"
{
    export default function pack(target: string): Promise<Buffer>;
}
const patterns =
{
    clean:
    {
        exclude: /@?types|fixtures|node_modules|interfaces|environment/,
        include: /\.(js(\.map)?|d\.ts|tsbuildinfo)$/,
    },
};

export default patterns;
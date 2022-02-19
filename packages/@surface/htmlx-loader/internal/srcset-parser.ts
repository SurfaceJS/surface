const imagePattern = /\s*([^,]\S*[^,](?:\s+[^,]+)?)\s*(?:,|$)/;

const KNOWN_DESCRIPTORS = new Set(["width", "height", "density"]);

export type SrcSet =
{
    url:      string,
    width?:   number,
    height?:  number,
    density?: number,
};

export default class SrcSetParser
{
    public static parse(value: string): SrcSet[]
    {
        return value.split(imagePattern)
            .filter((_, index) => index % 2 == 1)
            .map
            (
                part =>
                {
                    const [url, ...descriptors] = part.trim().split(/\s+/) as [string, ...Exclude<(keyof SrcSet), "url">[]];

                    const result: SrcSet = { url };

                    for (const descriptor of descriptors)
                    {
                        const postfix = descriptor[descriptor.length - 1];
                        const value = Number.parseFloat(descriptor.slice(0, -1));

                        switch (postfix)
                        {
                            case "w":
                                result.width = value;
                                break;
                            case "h":
                                result.height = value;
                                break;
                            case "x":
                                result.density = value;
                                break;

                            // No default
                        }
                    }

                    return result;
                });
    }

    public static stringify(elements: SrcSet[]): string
    {
        return elements.map
        (
            element =>
            {
                if (!element.url)
                {
                    throw new Error("URL is required");
                }

                const descriptorKeys = Object.keys(element).filter(key => KNOWN_DESCRIPTORS.has(key)) as Exclude<(keyof SrcSet), "url">[];

                const result = [element.url];

                for (const descriptorKey of descriptorKeys)
                {
                    const value = element[descriptorKey];

                    let postfix;

                    switch (descriptorKey)
                    {
                        case "width":
                            postfix = "w";
                            break;
                        case "height":
                            postfix = "h";
                            break;
                        case "density":
                            postfix = "x";
                            break;

                        // No default
                    }

                    const descriptor = `${value}${postfix}`;

                    result.push(descriptor);
                }

                return result.join(" ");
            },
        ).join(", ");
    }
}
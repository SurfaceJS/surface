async function loader(content)
{
    const module = await import("./index.js");

    return await module.default.call(this, content);
}

module.exports = loader;
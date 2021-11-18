async function apply(content)
{
    const module = await import("./index.js");

    return await module.default.call(this, content);
}

module.exports = apply;
import fs       from "fs";
import path     from "path";
import IPackage from "../interfaces/package";

const surface = path.resolve(__dirname, "../../source/@surface");

export default fs.readdirSync(surface)
    .map(x => path.join(surface, x, "package.json"))
    .filter(x => fs.existsSync(x))
    .map(x => ({ ...require(x), ...{ path: path.resolve(x, "../") }})) as Array<IPackage>;
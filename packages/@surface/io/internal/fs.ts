import fs   from "fs";
import util from "util";

export const existsSync    = fs.existsSync;
export const lstatAsync    = util.promisify(fs.lstat);
export const lstatSync     = fs.lstatSync;
export const mkdirAsync    = util.promisify(fs.mkdir);
export const mkdirSync     = fs.mkdirSync;
export const readdirAsync  = util.promisify(fs.readdir);
export const readdirSync   = fs.readdirSync;
export const readlinkAsync = util.promisify(fs.readlink);
export const readlinkSync  = fs.readlinkSync;
export const rmdirAsync    = util.promisify(fs.rmdir);
export const rmdirSync     = fs.rmdirSync;
export const statSync      = fs.statSync;
export const unlinkAsync   = util.promisify(fs.unlink);
export const unlinkSync    = fs.unlinkSync;
import fs            from "fs";
import { promisify } from "util";

const existsSync    = fs.existsSync;
const lstatAsync    = promisify(fs.lstat);
const lstatSync     = fs.lstatSync;
const mkdirAsync    = promisify(fs.mkdir);
const mkdirSync     = fs.mkdirSync;
const readdirAsync  = promisify(fs.readdir);
const readdirSync   = fs.readdirSync;
const readlinkAsync = promisify(fs.readlink);
const readlinkSync  = fs.readlinkSync;
const rmdirAsync    = promisify(fs.rmdir);
const rmdirSync     = fs.rmdirSync;
const statSync      = fs.statSync;
const unlinkAsync   = promisify(fs.unlink);
const unlinkSync    = fs.unlinkSync;

export
{
    existsSync,
    lstatAsync,
    lstatSync,
    mkdirAsync,
    mkdirSync,
    readdirAsync,
    readdirSync,
    readlinkAsync,
    readlinkSync,
    rmdirAsync,
    rmdirSync,
    statSync,
    unlinkAsync,
    unlinkSync,
};
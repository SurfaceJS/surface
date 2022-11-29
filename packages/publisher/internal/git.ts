import { rm, writeFile } from "fs/promises";
import os            from "os";
import { join }      from "path";
import { execute }   from "@surface/rwx";

const executeSilent = async (command: string): Promise<Buffer> =>
    execute(command, { silent: false });

export async function addTag(tag: string, message: string): Promise<void>
{
    await executeSilent(`git tag -a ${tag} -m "${message}"`);
}

export async function commit(message: string): Promise<void>
{
    const file = join(os.tmpdir(), `commit-message-${Date.now()}.txt`);
    await writeFile(file, message);
    await executeSilent(`git commit --no-verify -F "${file}"`);
    await rm(file);
}

export async function commitAll(message: string): Promise<void>
{
    await executeSilent("git add .");
    await commit(message);
}

export async function isWorkingTreeClean(): Promise<boolean>
{
    // return (await executeSilent("git status --porcelain")).toString() == "";

    return true;
}

export async function getRemoteUrl(remote: string): Promise<string>
{
    return (await execute(`git config --get "remote.${remote}.url"`)).toString();
}

export async function getRepoInfo(remote: string): Promise<[owner: string, project: string]>
{
    const remoteUrl = await getRemoteUrl(remote);
    const url       = new URL(remoteUrl.trim().replace(/^git@/, "https://").replace(/\.git$/, ""));
    const [, owner, ...project] = url.pathname.split("/");

    return [owner!, project.join("/")];
}

export async function pushToRemote(remote: string = "origin"): Promise<void>
{
    await executeSilent(`git push ${remote} --tags`);
}

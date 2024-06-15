import { info } from "@actions/core";
import { getOctokit } from "@actions/github";
import { run } from "@github/utilities/src/helpers/github-core";
import { RequestError } from "@octokit/types";
import { readFile } from "fs/promises";
import { StatusCodes } from "http-status-codes";
import { join } from "path";

type Inputs = 
{
    owner: string;
    repository: string;
    token: string;
    path: string;
};

type PackageMeta = 
{
    name: string;
    version: string;
    author: string;
};

await run<Inputs>
(
    async (inputs) =>
    {
        const octokit = getOctokit(inputs.token);

        const metaContent = await readFile(join(inputs.path, 'package.json'), { encoding: "utf-8" });
        const meta = JSON.parse(metaContent) as PackageMeta;

        try
        {
            const response = await octokit.rest.repos.getReleaseByTag
            (
                {
                    owner: inputs.owner,
                    repo: inputs.repository,
                    tag: meta.version
                }
            );

            switch(response.status as number)
            {
                case StatusCodes.OK:
                    throw new Error(`Release ${meta.version} already exists!`, { cause: response.data });
                case StatusCodes.NOT_FOUND:
                {
                    info(`Release ${meta.version} doesn't exist.`)
                    break;
                }
            }
        }
        catch(error)
        {
            if ((error as RequestError).status === StatusCodes.NOT_FOUND)
            {
                info(`Release ${meta.version} doesn't exist.`);
                return;
            }

            throw error;
        }
    }
);

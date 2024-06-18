import { info } from "@actions/core";
import { getOctokit } from "@actions/github";
import { run } from "@github/utilities/src/helpers/github-core";
import { isSuccessStatusCode } from "@github/utilities/src/helpers/http";
import { serializeObject } from "@github/utilities/src/helpers/serialization";
import { readFile } from "fs/promises";
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

type Asset = 
{
    path: string;
    name: string;
    label?: string;
};

type ReleaseManifest =
{
    meta: string;
    assets: Asset[];
};

await run<Inputs>
(
    async (inputs) =>
    {
        const manifestContent = await readFile(join(inputs.path, "release-manifest.json"), { encoding: "utf-8" });
        const manifest = JSON.parse(manifestContent) as ReleaseManifest;

        const metaContent = await readFile(join(inputs.path, manifest.meta), { encoding: "utf-8" });
        const meta = JSON.parse(metaContent) as PackageMeta;

        const octokit = getOctokit(inputs.token);

        const createReleaseResponse = await octokit.rest.repos.createRelease
        (
            {
                owner: inputs.owner,
                repo: inputs.repository,
                tag_name: meta.version,
                generate_release_notes: true
            }
        );

        if (!isSuccessStatusCode(createReleaseResponse.status))
            throw new Error("Unexpected API response", { cause: createReleaseResponse });

        info(`Release created ${serializeObject(createReleaseResponse.data)}`);

        for(const asset of manifest.assets)
        {
            const response = await octokit.rest.repos.uploadReleaseAsset
            (
                {
                    owner: inputs.owner,
                    repo: inputs.repository,
                    data: `@${join(inputs.path, asset.path)}`,
                    release_id: createReleaseResponse.data.id,
                    name: asset.name,
                    label: asset.label
                }
            );

            if (!isSuccessStatusCode(response.status))
                throw new Error("Unexpected API response", { cause: response });

            info(`Asset uploaded ${serializeObject(response.data)}`);
        }

        info(`Success`);
    }
);

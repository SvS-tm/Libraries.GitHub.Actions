import { info } from "@actions/core";
import { getOctokit } from "@actions/github";
import { run } from "@github/utilities/src/helpers/github-core";
import { isSuccessStatusCode } from "@github/utilities/src/helpers/http";
import { serializeObject } from "@github/utilities/src/helpers/serialization";

type Inputs = 
{
    owner: string;
    repository: string;
    token: string;
    release_id: string;
    path: string;
    name: string;
    label?: string;
};

type Outputs = 
{
    id: string;
    url: string;
    browser_download_url: string;
};

await run<Inputs, Outputs>
(
    async (inputs) =>
    {
        const octokit = getOctokit(inputs.token);

        const response = await octokit.rest.repos.uploadReleaseAsset
        (
            {
                owner: inputs.owner,
                repo: inputs.repository,
                data: `@${inputs.path}`,
                release_id:  Number(inputs.release_id),
                name: inputs.name,
                label: inputs.label
            }
        );

        if (!isSuccessStatusCode(response.status))
        {
            throw new Error("Unexpected API response", { cause: response });
        }

        info(`Success ${serializeObject(response.data)}`);

        return {
            id: String(response.data.id),
            url: response.data.url,
            browser_download_url: response.data.browser_download_url
        };
    }
);

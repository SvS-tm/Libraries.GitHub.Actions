import { info } from "@actions/core";
import { getOctokit } from "@actions/github";
import { castIfNotEmpty } from "@github/utilities/src/helpers/converting";
import { run } from "@github/utilities/src/helpers/github-core";
import { isSuccessStatusCode } from "@github/utilities/src/helpers/http";
import { serializeObject } from "@github/utilities/src/helpers/serialization";
import { Endpoints } from "@octokit/types";

type Inputs = 
{
    owner: string;
    repository: string;
    token: string;
    tag_name: string;
    target_commitish?: string;
    name?: string;
    body?: string;
    draft?: string;
    prerelease?: string;
    discussion_category_name?: string;
    generate_release_notes?: string;
    make_latest?: string;
};

type Outputs = 
{
    id: string;
    url: string;
    upload_url: string;
};

type MakeLatest = Endpoints['POST /repos/{owner}/{repo}/releases']['parameters']['make_latest'];

await run<Inputs, Outputs>
(
    async (inputs) =>
    {
        const octokit = getOctokit(inputs.token);

        const response = await octokit.rest.repos.createRelease
        (
            {
                owner: inputs.owner,
                repo: inputs.repository,
                tag_name: inputs.tag_name,
                body: inputs.body,
                draft: castIfNotEmpty(inputs.draft, Boolean),
                discussion_category_name: inputs.discussion_category_name,
                generate_release_notes: castIfNotEmpty(inputs.generate_release_notes, Boolean),
                make_latest: castIfNotEmpty<MakeLatest>(inputs.make_latest),
                name: inputs.name,
                prerelease: castIfNotEmpty(inputs.prerelease, Boolean),
                target_commitish: inputs.target_commitish
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
            upload_url: response.data.upload_url
        };
    }
);

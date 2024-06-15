import { info } from "@actions/core";
import { getOctokit } from "@actions/github";
import { run } from "@github/utilities/src/helpers/github-core";
import { isSuccessStatusCode } from "@github/utilities/src/helpers/http";
import { serializeObject } from "@github/utilities/src/helpers/serialization";
import { trimObject } from "@github/utilities/src/helpers/reflection";

type Inputs = 
{
    owner: string;
    organization: string;
    token: string;
    team_slug: string;
    repository: string;
    permission?: string;
};

await run<Inputs>
(
    async (inputs) =>
    {
        const octokit = getOctokit(inputs.token);

        const response = await octokit.request
        (
            "PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}", 
            {
                ...trimObject({ permission: inputs.permission }),
                org: inputs.organization,
                owner: inputs.owner,
                repo: inputs.repository,
                team_slug: inputs.team_slug
            }
        );

        if (!isSuccessStatusCode(response.status))
        {
            throw new Error("Unexpected API response", { cause: response });
        }

        info(`Success ${serializeObject(response)}`);
    }
);

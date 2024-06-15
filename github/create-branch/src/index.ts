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
    from: string;
    name: string;
};

await run<Inputs>
(
    async (inputs) =>
    {
        const octokit = getOctokit(inputs.token);

        const refResponse = await octokit.rest.git.getRef
        (
            {
                owner: inputs.owner,
                repo: inputs.repository,
                ref: `heads/${inputs.from}`
            }
        );

        if (!isSuccessStatusCode(refResponse.status))
            throw new Error("Unexpected API response", { cause: refResponse });

        const createRefResponse = await octokit.rest.git.createRef
        (
            {
                owner: inputs.owner,
                repo: inputs.repository,
                ref: `refs/heads/${inputs.name}`,
                sha: refResponse.data.object.sha
            }
        );

        if (!isSuccessStatusCode(createRefResponse.status))
            throw new Error("Unexpected API response", { cause: createRefResponse });

        info(`Successfully created new ref: ${serializeObject(createRefResponse)}`);
    }
);

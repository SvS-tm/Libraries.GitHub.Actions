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
};

type Outputs =
{
    name: string;
};

await run<Inputs, Outputs>
(
    async (inputs) =>
    {
        const octokit = getOctokit(inputs.token);

        const response = await octokit.rest.repos.get
        (
            {
                owner: inputs.owner,
                repo: inputs.repository
            }
        );

        if (!isSuccessStatusCode(response.status))
            throw new Error("Unexpected API response", { cause: response });

        info(`Successfully retreived repository info: ${serializeObject(response)}`);

        return {
            name: response.data.default_branch
        };
    }
);

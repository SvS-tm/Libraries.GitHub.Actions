import { info } from "@actions/core";
import { getOctokit } from "@actions/github";
import { castIfNotEmpty } from "@github/utilities/src/helpers/converting";
import { run } from "@github/utilities/src/helpers/github-core";
import { isSuccessStatusCode } from "@github/utilities/src/helpers/http";
import { serializeObject } from "@github/utilities/src/helpers/serialization";
import { trimObject } from "@github/utilities/src/helpers/reflection";

type Inputs = 
{
    token: string;
    repository: string;
    owner: string;
    name: string;
    description: string;
    delete_branch_on_merge: string;
    allow_auto_merge: string;
};

await run<Inputs>
(
    async (inputs) =>
    {
        const octokit = getOctokit(inputs.token);

        const response = await octokit.request
        (
            "PATCH /repos/{owner}/{repo}",
            {
                ...trimObject
                (
                    {
                        name: inputs.name,
                        description: inputs.description,
                        allow_auto_merge: castIfNotEmpty(inputs.allow_auto_merge, Boolean),
                        delete_branch_on_merge: castIfNotEmpty(inputs.delete_branch_on_merge, Boolean)
                    }
                ),
                owner: inputs.owner,
                repo: inputs.repository
            }
        );

        if (!isSuccessStatusCode(response.status))
        {
            throw new Error("Unexpected API response", { cause: response });
        }

        info(`Success ${serializeObject(response)}`);
    }
);

export {};


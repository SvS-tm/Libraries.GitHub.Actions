import { info } from "@actions/core";
import { getOctokit } from "@actions/github";
import { run } from "@github/utilities/src/helpers/github-core";
import { isSuccessStatusCode } from "@github/utilities/src/helpers/http";
import { serializeObject } from "@github/utilities/src/helpers/serialization";
import { trimObject } from "@github/utilities/src/helpers/reflection";
import fs from "fs";

type Inputs = 
{
    owner: string;
    repository: string;
    token: string;
    ruleset_path: string;
};

await run<Inputs>
(
    async (inputs) =>
    {
        const octokit = getOctokit(inputs.token);

        const json = await fs.promises.readFile(inputs.ruleset_path, { encoding: "utf-8" });

        const body = JSON.parse(json);

        const response = await octokit.request
        (
            "POST /repos/{owner}/{repo}/rulesets", 
            {
                ...body,
                repo: inputs.repository,
                owner: inputs.owner
            }
        );

        if (!isSuccessStatusCode(response.status))
        {
            throw new Error("Unexpected API response", { cause: response });
        }

        info(`Success ${serializeObject(response)}`);
    }
);

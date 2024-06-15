import { info } from "@actions/core";
import { getOctokit } from "@actions/github";
import { run } from "@github/utilities/src/helpers/github-core";
import { minify } from "@github/utilities/src/helpers/graph-ql";
import { serializeObject } from "@github/utilities/src/helpers/serialization";

type Inputs = 
{
    project: string;
    repository: string;
    token: string;
};

type Response = 
{
    linkProjectV2ToRepository: 
    { 
        clientMutationId: string,
        repository: 
        { 
            id: string; 
        } 
    }
};

await run<Inputs>
(
    async (inputs) =>
    {
        const octokit = getOctokit(inputs.token);

        const query = minify
        (
            `
            mutation 
            {
                linkProjectV2ToRepository
                (
                    input: 
                    { 
                        projectId: "${inputs.project}", 
                        repositoryId: "${inputs.repository}"
                    }
                ) 
                { 
                    clientMutationId 
                    repository { id }
                } 
            }
            `
        );

        const response = await octokit.graphql<Response>(query);

        info(`Success ${serializeObject(response)}`);
    }
);

export {}

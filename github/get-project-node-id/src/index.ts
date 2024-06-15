import { info, debug } from "@actions/core";
import { getOctokit } from "@actions/github";
import { run } from "@github/utilities/src/helpers/github-core";
import { minify } from "@github/utilities/src/helpers/graph-ql";
import { serializeObject } from "@github/utilities/src/helpers/serialization";

type Inputs = 
{
    organization: string;
    project: string;
    token: string;
};

type Outputs = 
{
    node_id: string;
};

type Response = 
{
    organization: 
    {
        projectV2:
        { 
            id: string;
        }
    }
};

await run<Inputs, Outputs>
(
    async (inputs) =>
    {
        const octokit = getOctokit(inputs.token);
        
        const query = minify
        (
            `
            query 
            { 
                organization(login: "${inputs.organization}")
                { 
                    projectV2(number: ${inputs.project}) 
                    { 
                        id
                    }
                } 
            }
            `
        );

        const response = await octokit.graphql<Response>(query);

        info(`Success ${serializeObject(response)}`);

        const result = {
            node_id: response.organization.projectV2.id
        };

        return result;
    }
);

export {}

import { info } from "@actions/core";
import { getOctokit } from "@actions/github";
import { run } from "@github/utilities/src/helpers/github-core";
import { isEmpty } from "@github/utilities/src/helpers/guards";
import { isSuccessStatusCode } from "@github/utilities/src/helpers/http";
import { trimObject } from "@github/utilities/src/helpers/reflection";
import { serializeObject } from "@github/utilities/src/helpers/serialization";
import { Readable } from "stream";
import { Extract } from "unzip-stream";

type Inputs = 
{
    owner: string;
    repository: string;
    token: string;
    artifact_name: string;
    path?: string;
};

await run<Inputs>
(
    async (inputs) =>
    {
        const octokit = getOctokit(inputs.token);
        
        const response = await octokit.paginate
        (
            "GET /repos/{owner}/{repo}/actions/artifacts", 
            {
                repo: inputs.repository,
                owner: inputs.owner,
                ...trimObject
                (
                    { 
                        name: inputs.artifact_name 
                    }
                )
            }
        );

        info(`Success response ${serializeObject(response)}`);

        //Ids are incremental
        const artifact = response
            .filter(artifact => !artifact.expired)
            .reduce((previous, current) => previous.id > current.id ? previous : current );

        if (isEmpty(artifact))
            throw new Error("Could not find any non-expired artifact!");

        info(`Latest artifact ${serializeObject(artifact)}`);

        const downloadResponse = await octokit.rest.actions.downloadArtifact
        (
            {
                archive_format: 'zip',
                artifact_id: artifact.id,
                repo: inputs.repository,
                owner: inputs.owner
            }
        );

        if (!isSuccessStatusCode(downloadResponse.status))
        {
            throw new Error
            (
                "Unexpected response for artifact download", 
                { cause: { status: downloadResponse } }
            );
        }

        info(`Successfully received download response ${serializeObject(downloadResponse)}`);

        const path = inputs.path ?? (process.env['GITHUB_WORKSPACE'] as string);

        await new Promise<void>
        (
            (resolve, reject) =>
            {
                const buffer = Buffer.from(downloadResponse.data as ArrayBuffer);
                
                Readable.from(buffer)
                    .pipe(Extract({ path }))
                    .on('close', () => resolve())
                    .on('error',  reject);
            }
        );

        info(`Extraction complete: ${path}`);
    }
);

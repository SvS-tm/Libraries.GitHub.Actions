import { info } from "@actions/core";
import { run } from "@github/utilities/src/helpers/github-core";
import { execSync } from "child_process";
import { readFile } from "fs/promises";
import { join } from "path";

type Inputs = 
{
    owner: string;
    repository: string;
    token: string;
    path: string;
};

type Asset = 
{
    path: string;
    name: string;
    label?: string;
};

type ReleaseManifest =
{
    meta: string;
    assets: Asset[];
};

await run<Inputs>
(
    async (inputs) =>
    {
        const manifestContent = await readFile(join(inputs.path, "release-manifest.json"), { encoding: "utf-8" });
        const manifest = JSON.parse(manifestContent) as ReleaseManifest;

        await Promise.all
        (
            manifest.assets
                .filter(asset => asset.label === "package")
                .map
                (
                    (asset) => new Promise<void>
                    (
                        (resolve, reject) =>
                        {
                            try
                            {
                                execSync
                                (
                                    `pnpm publish ${asset.path}`, 
                                    { 
                                        stdio: 'inherit', 
                                        env: 
                                        {
                                            ...process.env,
                                            GITHUB_TOKEN: inputs.token
                                        } 
                                    }
                                );
                            }
                            catch(error)
                            {
                                reject(error);
                            }

                            resolve();
                        }
                    )
                )
        );

        info(`Success`);
    }
);

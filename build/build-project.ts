import { execSync } from "child_process";
import fs from "fs";
import moment from "moment";
import webpack from "webpack";
import { format } from "./console.js";
import options from "./webpack.config.js";
import prettyBytes from "pretty-bytes";

async function clean()
{
    if (!options.output?.path)
        return;

    console.info("Cleaning", options.output.path);

    try
    {
        if (fs.existsSync(options.output.path))
            await fs.promises.rm(options.output?.path, { recursive: true });
        else
        {
            console.info
            (
                ...format
                (
                    "Cleaning omitted, no build results found.",
                    "fgGray"
                )
            );
        }
    }
    catch(error)
    {
        console.error
        (
            ...format("Could not clean previous build results", "fgRed"), 
            error
        );

        throw error;
    }
}

function executeWebpack()
{
    console.info("Starting Webpack...");

    webpack
    (
        options,
        (error, stats) =>
        {
            if (error)
            {
                if (stats)
                {
                    console.error
                    (
                        ...format("Error", "fgRed"),  
                        stats.compilation.compiler.context,
                        error
                    );
                }
                else
                {
                    console.error
                    (
                        ...format("Error", "fgRed"),
                        error
                    );
                }
            }
            else
            {
                if (stats)
                {
                    console.info
                    (
                        ...format("Webpack transpilation succeded", "fgGreen"),  
                        stats.compilation.compiler.context
                    );
    
                    console.info
                    (
                        ...format
                        (
                            "Elapsed:", 
                            "bgGray"
                        ),
                        moment.utc(stats.endTime - stats.startTime)
                            .format("mm:ss.SSSS")
                    );
    
                    const totalSize = Object.keys(stats.compilation.assets)
                        .map(key => stats.compilation.assets[key])
                        .reduce((size, asset) => size + asset.size(), 0);
    
                    if (totalSize <= 0)
                    {
                        console.warn
                        (
                            ...format("No assets produced!", "bgYellow", "fgBlack")
                        );
                    }
                    else
                    {
                        console.info
                        (
                            ...format("Produced assets total size of:", "bgGreen", "fgGray"),
                            prettyBytes(totalSize)
                        );
                    }
                }
                else
                {
                    console.info
                    (
                        ...format("Webpack transpilation succeded", "fgGreen")
                    );

                    console.warn
                    (
                        ...format("No stats available!", "bgYellow", "fgBlack")
                    );
                }
            }
        }
    );
}

function executeTsc()
{
    console.info("Starting TypeScript compilation...");

    try
    {
        execSync("tsc", { stdio: 'inherit' });

        console.info
        (
            ...format("TypeScript compilation succeeded", "fgGreen")
        );
    }
    catch(error)
    {
        console.error
        (
            ...format("TypeScript compilation failed", "fgRed"),
            options.name, 
            error
        );

        throw error;
    }
}

async function build()
{
    await clean();
    executeTsc();
    executeWebpack();
}

build();

export {}

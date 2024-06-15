import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { availableParallelism } from "os";
import { format } from "./console.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildProject = path.resolve(__dirname, "build-project.ts");
const tsconfig = path.resolve(__dirname, "tsconfig.json");
const command = 
[
    "pnpm",
    "-r",
    `--workspace-concurrency=${availableParallelism()}`, 
    `exec tsx ${buildProject}`, 
    `--tsconfig ${tsconfig}`
]
    .join(" ");

try
{
    console.info(...format(command, 'bgGreen'));
    execSync(command, { stdio: 'inherit' });
}
catch (error) 
{
    console.error('Error occurred:', error);
    process.exit(1);
}

export {}

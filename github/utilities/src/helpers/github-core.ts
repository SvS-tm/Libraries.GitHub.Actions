import { getInput, info, setOutput, error, setFailed } from "@actions/core";
import { serializeObject } from "./serialization";

export type GithubActionIoParameters = {
    [key: string]: string;
};

export function getInputs<T_Inputs extends GithubActionIoParameters>()
{
    const cache: { [key: string | symbol]: string | undefined | null } = {};

    return new Proxy
    (
        cache, 
        {
            get(target, key)
            {
                if (typeof key === 'symbol')
                    return target[key];

                let value = target[key];

                if (value === undefined)
                {
                    value = getInput(key);

                    return (target[key] = value ? value : null);
                }

                return value;
            }
        }
    ) as T_Inputs;
}

export function setOutputs<T_Outputs extends GithubActionIoParameters>
(
    parameters: T_Outputs
)
{
    for(const key in parameters)
    {
        info(`Setting output ${key}`);
        
        setOutput(key, parameters[key]);
    }
}

export async function run
<
    T_Inputs extends GithubActionIoParameters | void = void,
    T_Outputs extends GithubActionIoParameters | void = void
>
(
    action: (inputs: T_Inputs) => Promise<T_Outputs> | T_Outputs
)
{
    try
    {
        const inputs = getInputs();

        const outputs = await action(inputs as T_Inputs);

        if (outputs)
            setOutputs(outputs);
    }
    catch (exc)
    {
        const content = serializeObject(exc);

        error(content);
        
        setFailed(content);
    }
}

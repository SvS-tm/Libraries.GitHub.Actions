import { isNotEmpty } from "./guards";

export function trimObject<T_Object extends object>(object: T_Object) : Partial<T_Object>
{
    const result: Partial<T_Object> = {};

    for(const key in object)
    {
        const value = object[key];

        if (isNotEmpty(value))
        {
            result[key] = value;
        }
    }

    return result;
}

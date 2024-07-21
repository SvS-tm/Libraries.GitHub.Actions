import { StringLike } from "../system/types/string-like";
import { isEmpty, isNotEmpty } from "./guards";

export const getString = (value: StringLike | undefined | null) =>
{
    if (isNotEmpty(value))
    {
        switch (typeof value)
        {
            case "string":
                return value;
            case "function":
            {
                const result = value();

                if (typeof result === "string")
                {
                    return result;
                }

                break;
            }
            default:
            {
                const result = value?.toString();

                if (typeof result === "string")
                {
                    return result;
                }

                break;
            }
        }
    }

    return undefined;
};

export function isEmptyOrWhitespace(value: string | null | undefined): boolean
{
    return isEmpty(value) || !value.length || /^[\s\t]+$/.test(value);
}

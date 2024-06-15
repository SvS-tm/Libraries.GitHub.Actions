import { StringLike } from "../system/types/string-like";
import { isNotEmpty } from "./guards";

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

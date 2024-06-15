import { Converter } from "../system/types/converter";
import { Emptyable } from "../system/types/emptyable";
import { Undefinable } from "../system/types/undefinable";
import { isNotEmpty } from "./guards";

export function castIfNotEmpty<T_Type>(value: Emptyable<unknown>, converter?: Converter<T_Type>): Undefinable<T_Type>
{
    if (isNotEmpty(value))
    {
        if (isNotEmpty(converter))
            return converter(value);

        return value as T_Type;
    }

    return undefined;
}

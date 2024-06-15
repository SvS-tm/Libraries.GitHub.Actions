export function isNotEmpty<T_Value>(value: T_Value): value is Exclude<T_Value, undefined | null>
{
    return value !== undefined && value !== null;
};

export function isEmpty<T_Value>(value: T_Value | undefined | null): value is undefined | null
{
    return value === undefined || value === null;
};

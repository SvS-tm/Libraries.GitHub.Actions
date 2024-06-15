export interface Converter<T_Type>
{
    <TInput>(value?: TInput): T_Type;
};

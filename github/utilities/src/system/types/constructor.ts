export interface Constructor<T_Type, T_Arguments extends any[] = any[]>
{
    new (...parameters: T_Arguments): T_Type;
}

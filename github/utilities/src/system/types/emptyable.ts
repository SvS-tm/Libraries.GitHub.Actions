import { Nullable } from "./nullable";
import { Undefinable } from "./undefinable";

export type Emptyable<T_Type> = Nullable<T_Type> | Undefinable<T_Type>;

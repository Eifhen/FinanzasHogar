import { SchemaDefinition } from "@tediousjs/connection-string";

export interface CoerceTypeMap {
    string: string;
    number: number;
    boolean: boolean;
}

export type CoerceType = keyof CoerceTypeMap;

/** Este tipo es una copia del InferSchema de tedious/connection-string
 * ya que tedious no exporta este tipo, me vi en la obligación 
 * de crear una copia yo mismo */
export type InferSchema<T extends SchemaDefinition> = {
   [K in keyof T]: T[K]['type'] extends CoerceType ? CoerceTypeMap[T[K]['type']] : string;
};

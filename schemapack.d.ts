declare module "schemapack" {
  export type SchemapackTypes =
    | "bool"
    | "boolean"
    | "int8"
    | "uint8"
    | "int16"
    | "uint16"
    | "int32"
    | "uint32"
    | "float32"
    | "float64"
    | "string"
    | "varuint"
    | "varint"
    | "buffer";

  export type TSchemapackObject<T = any> = {
    [K in keyof T]: SchemapackTypes | SchemapackTypes[] | TSchemapackObject<T>;
  };

  export interface SchemapackParser {
    encode(input: any): Buffer;
    decode(input: Buffer): any;
  }

  export function build<T extends Object>(
    schema: TSchemapackObject<T>
  ): SchemapackParser;
}

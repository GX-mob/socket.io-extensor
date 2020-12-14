export type ProtobufSupportedTypes =
  | "double"
  | "float"
  | "int32"
  | "uint32"
  | "sint32"
  | "fixed32"
  | "sfixed32"
  | "int64"
  | "uint64"
  | "sint64"
  | "fixed64"
  | "sfixed64"
  | "string"
  | "bool"
  | "bytes";

export type ProtobufSchemaObject = {
  [fieldName: string]: {
    id: number;
    type: ProtobufSupportedTypes;
    repeated?: boolean;
  };
};

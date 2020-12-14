export type TEventsBase = Record<string, any>;

export interface IParserEngine<Events extends TEventsBase> {
  encoder: IEncoderConstructor;
  decoder: IDecoderConstructor;
  eventsSchemasParsers: TPublicFunctionsMap<Events>;
}

export type TParserSupportedTypes =
  | "buffer"
  | "string"
  | "int"
  | "uint"
  | "float"
  | "float32"
  | "float64"
  | "bool";

export type TParserSchemasStructure<T = any> = {
  [K in keyof T]: TParserSupportedTypes | [TParserSupportedTypes];
};

export type TParserEventsSchemas<T extends TEventsBase = TEventsBase> = {
  [K in keyof T]: {
    id: number;
    schema: TParserSchemasStructure<T[K]>;
  };
};

export interface IParserFunctions<T> {
  encode(value: T): Buffer;
  decode(value: Buffer): T;
}

export enum ParserEngines {
  Protobuf = "protobuf",
  Schemapack = "schemapack",
}

export type TPublicFunctionsMap<T extends TEventsBase = TEventsBase> = {
  [K in keyof T]: IParserFunctions<T[K]>;
};

export interface IDecoder {
  add(packet: string | Buffer): void;
  parseJSON(packet: string): void;
  parseBinary(packet: Buffer): void;
  destroy(): void;
}

export interface IDecoderConstructor {
  new (): IDecoder;
}

export type TEncoderCallback = (result: (string | Buffer)[]) => void;

export interface IEncoder {
  encode(packet: IPacket, callback: TEncoderCallback): void;
  packJSON(packet: IPacket): string;
  packBinary(packet: IPacket): Buffer | string;
}

export interface IEncoderConstructor {
  new (): IEncoder;
}

export enum EPacketTypes {
  CONNECT = 0,
  DISCONNECT = 1,
  EVENT = 2,
  ACK = 3,
  ERROR = 4,
  BINARY_EVENT = 5,
  BINARY_ACK = 6,
}

export interface IPacket {
  id?: number;
  _id?: unknown;
  type: EPacketTypes;
  data: unknown[];
  nsp: string;
  options?: {
    compress: boolean;
  };
}

export type TEventsSchemaParser = IParserFunctions<IPacket>;

export type IDMap = Record<number, string>;
export type PacketsParsers = Record<string, TEventsSchemaParser>;

export type TypesMap<T> = Record<TParserSupportedTypes, T>;

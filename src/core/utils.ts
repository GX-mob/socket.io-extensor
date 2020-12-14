import Debug from "debug";

export type ValueOf<T> = T[keyof T];

export const debug = Debug("socket.io-extensor");
export const ParserDebug = debug.extend("parser");
export const ServerDebug = debug.extend("server");
export const ClientDebug = debug.extend("client");

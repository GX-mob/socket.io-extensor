import { EventEmitter } from "eventemitter3";
import { ParserDebug } from "../../utils";
import {
  EPacketTypes,
  IPacket,
  PacketsParsers,
  TParserEventsSchemas,
  IEncoder,
  TEncoderCallback,
  IEncoderConstructor,
} from "../parsers.types";

const debug = ParserDebug.extend("schemapack").extend("decoder");

export function buildEncoder(
  eventsSchemas: TParserEventsSchemas,
  packetsParsers: PacketsParsers
): IEncoderConstructor {
  return class ProtobufEncoder extends EventEmitter implements IEncoder {
    encode(packet: IPacket, callback: TEncoderCallback) {
      switch (packet.type) {
        case EPacketTypes.EVENT:
        case EPacketTypes.BINARY_EVENT:
          if (!((packet.data[0] as string) in eventsSchemas)) {
            return callback([this.packJSON(packet)]);
          }

          return callback([this.packBinary(packet)]);
        default:
          return callback([this.packJSON(packet)]);
      }
    }
    packJSON(packet: IPacket) {
      try {
        debug("json packet %j", packet);
        return JSON.stringify(packet);
      } catch (e) {
        debug("json error: %s", e.message);
        return this.errorPacket(e.message);
      }
    }
    packBinary(packet: IPacket) {
      try {
        const [name, data] = packet.data as [string, string[]];
        const eventParser = packetsParsers[name];

        debug("binary packet %j", packet);

        return eventParser.encode({
          ...packet,
          data,
          _id: eventsSchemas[name].id,
          nsp: packet.nsp,
          id: "id" in packet ? packet.id : -1,
        });
      } catch (e) {
        debug("binary error: %s", e.message);
        return this.errorPacket(e.message);
      }
    }

    private errorPacket(message: string) {
      return `{"type": ${EPacketTypes.ERROR}, "data": "parser error, ${message}"}`;
    }
  };
}

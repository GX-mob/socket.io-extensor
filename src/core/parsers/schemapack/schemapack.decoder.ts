import { EventEmitter } from "eventemitter3";
import { ParserDebug } from "../../utils";
import {
  IDecoder,
  EPacketTypes,
  IDecoderConstructor,
  IPacket,
  IDMap,
  PacketsParsers,
} from "../parsers.types";

const debug = ParserDebug.extend("schemapack").extend("decoder");

export function buildDecoder(
  eventsIDMap: IDMap,
  packetsSchemasParsers: PacketsParsers
): IDecoderConstructor {
  return class SchemapackDecoder extends EventEmitter implements IDecoder {
    add(packet: string | Buffer) {
      if (typeof packet === "string") {
        this.parseJSON(packet);
      } else {
        this.parseBinary(packet);
      }
    }

    parseJSON(packet: string) {
      try {
        const decoded = JSON.parse(packet);
        debug("json packet %j", decoded);
        this.emit("decoded", decoded);
      } catch (e) {
        debug("json error, packet: %s, error: %s", packet, e.message);
        this.emit("decoded", {
          type: EPacketTypes.ERROR,
          data: `parser error: ${e.message}`,
        });
      }
    }

    parseBinary(packet: Buffer) {
      try {
        const view = new Uint8Array(packet);
        const eventId = view[0];
        const eventName = eventsIDMap[eventId];
        const eventSchema = packetsSchemasParsers[eventName];
        const decodedPakcet = eventSchema.decode(packet);
        const finalPacket: IPacket = {
          type: EPacketTypes.EVENT,
          data: [eventName, decodedPakcet.data],
          nsp: decodedPakcet.nsp,
        };

        if (decodedPakcet.id !== -1) {
          finalPacket.id = decodedPakcet.id;
        }

        debug("binary packet: %j", finalPacket);

        this.emit("decoded", finalPacket);
      } catch (e) {
        debug("binary error: %s", e.message);

        this.emit("decoded", {
          type: EPacketTypes.ERROR,
          data: `parser error: ${e.message}`,
        });
      }
    }

    destroy() {
      debug("decoder destroyed");
    }
  };
}

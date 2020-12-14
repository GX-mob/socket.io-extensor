import { Field, Type } from "protobufjs";
import { ParserEngineBase } from "../parser-engine";
import {
  TParserEventsSchemas,
  TParserSchemasStructure,
} from "../parsers.types";
import { ProtobufSchemaObject, ProtobufSupportedTypes } from "./protobuf.types";
import { buildDecoder } from "./protobuf.decoder";
import { buildEncoder } from "./protobuf.encoder";

function parseIfNumber(value: any) {
  return isNaN(value) ? value : parseFloat(value);
}

export class ProtobufParser<Events> extends ParserEngineBase<
  Events,
  ProtobufSupportedTypes,
  ProtobufSchemaObject
> {
  constructor(eventsSchemas: TParserEventsSchemas) {
    super(eventsSchemas, {
      string: "string",
      uint: "uint64",
      int: "int64",
      float: "float",
      float32: "float",
      float64: "double",
      bool: "bool",
      buffer: "bytes",
    });
  }

  buildParsers() {
    Object.entries(this.eventsSchemas).forEach(
      ([eventName, { id, schema }]) => {
        this.validateEventSchema(eventName, { id, schema });

        this.idMap[id] = eventName;
        const eventSchema = this.eventSchemaAdapter(schema);

        this.packetsSchemasParsers[eventName] = this.buildSchema(eventName, {
          _id: { id: 1, type: "int32" },
          data: { id: 2, type: "bytes" },
          id: { id: 3, type: "int64" },
          nsp: { id: 4, type: "string" },
          type: { id: 5, type: "int32" },
        });

        this.eventsSchemasParsers[eventName as keyof Events] = this.buildSchema(
          eventName,
          eventSchema
        );
      }
    );
  }

  eventSchemaAdapter(input: TParserSchemasStructure) {
    const output: ProtobufSchemaObject = {};

    Object.entries(input).forEach(([key, type], id) => {
      if (Array.isArray(type)) {
        output[key] = { id: id, type: "string", repeated: true };
        return;
      }

      output[key] = { id: id, type: this.typesMap[type], repeated: false };
    });

    return output;
  }

  buildSchema(eventName: string, schema: ProtobufSchemaObject) {
    const messageObject = new Type(eventName);

    Object.entries(schema).forEach(([field, schema], index) => {
      const fieldObject = new Field(field, index, schema.type, {
        repeated: !!schema.repeated,
      });
      messageObject.add(fieldObject);
    });

    return {
      encode: (input: Object): Buffer => {
        const message = messageObject.fromObject(input);

        return messageObject.encode(message).finish() as Buffer;
      },
      decode: (input: Buffer): any => {
        const raw: Record<string, string> = messageObject
          .decode(input)
          .toJSON();
        const output: Record<string, unknown> = {};

        Object.entries(raw).forEach(([field, value]) => {
          if (schema[field].repeated) {
            output[field] = Array.isArray(value)
              ? value
              : value.split(",").map((value) => parseIfNumber(value));
            return;
          }

          output[field] = parseIfNumber(value);
        });
        return output;
      },
    };
  }

  buildEncoder() {
    return buildEncoder(this.eventsSchemas, this.packetsSchemasParsers);
  }

  buildDecoder() {
    return buildDecoder(this.idMap, this.packetsSchemasParsers);
  }
}

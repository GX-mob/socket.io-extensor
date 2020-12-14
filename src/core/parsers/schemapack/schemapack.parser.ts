import schemapack, { SchemapackTypes, TSchemapackObject } from "schemapack";
import {
  TParserSchemasStructure,
  TParserEventsSchemas,
} from "../parsers.types";
import { ParserEngineBase } from "../parser-engine";
import { buildDecoder } from "./schemapack.decoder";
import { buildEncoder } from "./schemapack.encoder";

export class SchemapackParser<Events> extends ParserEngineBase<
  Events,
  SchemapackTypes,
  TSchemapackObject
> {
  constructor(eventsSchemas: TParserEventsSchemas) {
    super(eventsSchemas, {
      string: "string",
      uint: "varuint",
      int: "varint",
      float: "float32",
      float32: "float32",
      float64: "float64",
      bool: "boolean",
      buffer: "buffer",
    });
  }

  buildParsers() {
    Object.entries(this.eventsSchemas).forEach(
      ([eventName, { id, schema }]) => {
        this.validateEventSchema(eventName, { id, schema });

        this.idMap[id] = eventName;
        const eventSchema = this.eventSchemaAdapter(schema);

        this.packetsSchemasParsers[eventName] = this.buildSchema(eventName, {
          _id: "varuint",
          data: eventSchema,
          id: "varint",
          nsp: "string",
          type: "varint",
        });

        this.eventsSchemasParsers[eventName as keyof Events] = this.buildSchema(
          eventName,
          eventSchema
        );
      }
    );
  }

  buildEncoder() {
    return buildEncoder(this.eventsSchemas, this.packetsSchemasParsers);
  }

  buildDecoder() {
    return buildDecoder(this.idMap, this.packetsSchemasParsers);
  }

  buildSchema(_eventName: string, schema: TSchemapackObject) {
    return schemapack.build(schema);
  }

  eventSchemaAdapter(input: TParserSchemasStructure) {
    const output: TSchemapackObject = {};

    Object.entries(input).forEach(([key, type]) => {
      if (Array.isArray(type)) {
        output[key] = type.map((arrKey) => this.typesMap[arrKey]);
        return;
      }

      // if (type instanceof Object) {
      //   output[key] = this.eventSchemaAdapter(type);
      //   return;
      // }
      output[key] = this.typesMap[type];
    });

    return output;
  }
}

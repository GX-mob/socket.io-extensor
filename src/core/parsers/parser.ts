import {
  ParserEngines,
  TParserEventsSchemas,
  TPublicFunctionsMap,
  IParserEngine,
  TEventsBase,
  IDecoderConstructor,
  IEncoderConstructor,
} from "./parsers.types";
import { ProtobufParser } from "./protobuf";
import { SchemapackParser } from "./schemapack";

export { ProtobufParser, SchemapackParser };

export class Parser<Events extends TEventsBase = TEventsBase> {
  public Encoder: IEncoderConstructor;
  public Decoder: IDecoderConstructor;
  public schemas: TPublicFunctionsMap<Events>;
  private parserEngineInstance: IParserEngine<Events>;

  constructor(
    private eventsSchemas: TParserEventsSchemas<Events>,
    readonly parserEngine: ParserEngines
  ) {
    switch (parserEngine) {
      case ParserEngines.Schemapack:
        this.parserEngineInstance = new SchemapackParser<Events>(
          this.eventsSchemas
        );
        break;
      case ParserEngines.Protobuf:
        this.parserEngineInstance = new ProtobufParser<Events>(
          this.eventsSchemas
        );
        break;
      default:
        throw new Error("Invalid parser engine");
    }

    this.Decoder = this.parserEngineInstance.decoder;
    this.Encoder = this.parserEngineInstance.encoder;
    this.schemas = this.parserEngineInstance.eventsSchemasParsers;
  }
}

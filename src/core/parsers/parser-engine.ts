import {
  IDecoderConstructor,
  IDMap,
  IEncoderConstructor,
  IParserEngine,
  IParserFunctions,
  PacketsParsers,
  TParserEventsSchemas,
  TParserSchemasStructure,
  TPublicFunctionsMap,
  TypesMap,
} from "./parsers.types";

export abstract class ParserEngineBase<
  Events,
  EngineSupportedTypes,
  BuildSchemaStructure
> implements IParserEngine<Events> {
  public encoder: IEncoderConstructor;
  public decoder: IDecoderConstructor;
  public typesMap!: TypesMap<EngineSupportedTypes>;
  public idMap: IDMap = {};
  public packetsSchemasParsers: PacketsParsers = {};
  public eventsSchemasParsers: TPublicFunctionsMap<Events> = {} as TPublicFunctionsMap<Events>;

  constructor(
    public eventsSchemas: TParserEventsSchemas,
    typesMap: TypesMap<EngineSupportedTypes>
  ) {
    this.typesMap = typesMap;
    this.buildParsers();

    this.encoder = this.buildEncoder();
    this.decoder = this.buildDecoder();
  }

  protected validateEventSchema<
    T extends TParserEventsSchemas = TParserEventsSchemas
  >(eventName: string, { id, schema }: T[keyof T]) {
    if (typeof id === "undefined") {
      throw new Error(`Undefined ID for event ${eventName}`);
    }
    if (!schema) {
      throw new Error(`Undefined schema for event ${eventName}`);
    }
  }

  abstract buildParsers(): void;
  abstract buildEncoder(): IEncoderConstructor;
  abstract buildDecoder(): IDecoderConstructor;
  abstract buildSchema<T = any>(
    eventName: string,
    schema: BuildSchemaStructure
  ): IParserFunctions<T>;
  abstract eventSchemaAdapter(
    input: TParserSchemasStructure
  ): BuildSchemaStructure;
}

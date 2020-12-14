import { Parser, ParserEngines } from "../dist/core/parsers";

interface Events {
  eventName: {
    foo: string;
    bar: number;
    far: number[];
    raf: string[];
  };
}

const packet = {
  foo: "asd",
  bar: 1,
  far: [
    2.391283712,
    2.391283712,
    2.391283712,
    2.391283712,
    2.391283712,
    2.391283712,
    2.391283712,
    2.391283712,
  ],
  raf: ["string"],
};

const schemapackParser = new Parser<Events>(
  {
    eventName: {
      id: 1,
      schema: {
        foo: "string",
        bar: "int",
        far: ["float"],
        raf: ["string"],
      },
    },
  },
  ParserEngines.Schemapack
);

const spbuffer = schemapackParser.schemas.eventName.encode(packet);

console.log(
  "Buffer byte length:",
  spbuffer.length,
  "\n",
  "Decoded result",
  schemapackParser.schemas.eventName.decode(spbuffer)
);

const protobufParser = new Parser<Events>(
  {
    eventName: {
      id: 1,
      schema: {
        foo: "string",
        bar: "int",
        far: ["float"],
        raf: ["string"],
      },
    },
  },
  ParserEngines.Protobuf
);

const pbbuffer = protobufParser.schemas.eventName.encode(packet);

console.log(
  "Buffer byte length:",
  pbbuffer.length,
  "\n",
  "Decoded result",
  protobufParser.schemas.eventName.decode(pbbuffer)
);

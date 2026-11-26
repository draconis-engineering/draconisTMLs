# Draconis Training Markup Languages | Development Roadmap

## Phase 0: Design & Specification

- [x] Project structure and goals
- [x] DSML example and basic structure
- [ ] Complete syntax specification for all languages
  - [x] DSML (swim) - Initial design
  - [x] DRML (run) - Schema drafted
  - [x] DCML (bike) - Schema drafted
  - [x] DTIR (intermediate) - Schema drafted
- [x] XSD Schemas
  - [x] dsml.xsd
  - [x] drml.xsd
  - [x] dcml.xsd
  - [x] dtir.xsd

## Phase 1: Core Infrastructure

- [x] TypeScript type definitions
- [x] Basic parser implementation
- [x] Basic validator implementation
- [x] DTIR transformer foundation
- [x] Complete parser for all languages (DSML, DRML, DCML)
- [x] Full validation against XSD schemas (python xmlschema fallback; libxmljs2 optional)
- [x] XML writers/serializers

## Phase 2: Transformation & Integration

- [ ] Complete DTIR transformers for all sports
- [ ] Transpilers from/to other formats (JSON, etc.)
- [ ] CLI tools (validate, convert, pretty-print)
- [ ] Integration with Olympus

## Phase 3: Ecosystem

- [ ] More comprehensive examples
- [ ] Documentation and tutorials
- [ ] Community schemas/extensions
- [ ] Plaintext/structured text parsers

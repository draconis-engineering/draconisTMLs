# Draconis Training Markup Languages - Architecture

## Overview

DTMLs is an open-source XML-based standard for describing triathlon training sessions in a machine-readable, sport-agnostic way. Each sport has its own markup language with its own schema, unified through DTIR (Draconis Training Intermediate Representation).

## Languages

| Language                                             | File Extension | Purpose                                                    | Status                    |
| ---------------------------------------------------- | -------------- | ---------------------------------------------------------- | ------------------------- |
| DSML (Draconis Swimming Markup Language)             | `.dsml.xml`    | Swimming sessions                                          | In progress (has example) |
| DRML (Draconis Running Markup Language)              | `.drml.xml`    | Running sessions                                           | Planned                   |
| DCML (Draconis Cycling Markup Language)              | `.dcml.xml`    | Cycling sessions                                           | Planned                   |
| DTIR (Draconis Training Intermediate Representation) | `.dtir.xml`    | Common intermediate format for normalization/transpilation | Planned                   |

## Design Goals

1. **Human-readable and machine-parseable** - XML is verbose but unambiguous; should be easy to write and validate
2. **Sport-specific semantics** - Each language captures domain-specific concepts naturally
3. **Composable** - Sessions can be composed of reusable blocks (warmup, main set, cooldown)
4. **Extensible** - Schemas designed for future additions without breaking compatibility
5. **Interoperable** - DTIR provides a common format for tools to consume regardless of source sport language
6. **Standardized** - XSD validation ensures conformance across implementations

## Directory Structure

```
draconisTMLs/
├── schemas/           # XSD schema definitions
│   ├── dsml.xsd
│   ├── drml.xsd
│   ├── dcml.xsd
│   └── dtir.xsd
├── src/              # Example files and reference implementations
│   ├── dsml/
│   ├── drml/
│   ├── dcml/
│   └── dtir/
├── parsers/          # Parser implementations (multi-language)
│   ├── typescript/   # TS/JS parser
│   ├── python/       # Python parser (if needed)
│   └── ...
├── docs/             # Documentation
└── tools/            # CLI tools for validation, conversion
```

## Architecture Flow

```
Sport-specific XML (.dsml.xml/.drml.xml/.dcml.xml)
           ↓ (validate against sport XSD)
         Parser
           ↓ (parse to AST/objects)
       Transformer
           ↓ (normalize to DTIR)
         DTIR XML (.dtir.xml)
           ↓
       Writers/Transpilers
           ↓
    Target formats (JSON, plain text, training apps, etc.)
```

## Core Concepts

### Common Elements (across sports)

- **Session metadata**: id, name, date, description, athlete, coach
- **Configuration**: environment, equipment, constraints
- **Phases**: structured sections (warmup, main, cooldown, pre/post)
- **Sets/Intervals**: repetitions, blocks, with rest periods
- **Intensity**: RPE, pace/pace zones, power, heart rate zones
- **Duration/Distance**: flexible units (meters, yards, seconds, minutes, hours)

### DSML Specifics (Swimming)

Based on example: pool config, gear (paddles/fins/snorkel), strokes (freestyle, etc.), drills (superman), band work, sauna, repeats

## Schema Design Principles

- Use namespaces for each language to avoid collisions
- Strong typing with XSD simple/complex types
- Allow for both metric and imperial units where sensible
- Extensible via `any`/extension points carefully placed
- Clear documentation in schema annotations
- Versioning in schema root element or namespace

## Next Steps

1. Define XSD schemas for all four languages based on examples and use cases
2. Design object model/AST in code
3. Implement parsers (start with TypeScript/Node for broad compatibility)
4. Implement writers (XML serialization)
5. Implement DTIR transformation
6. Add validation CLI tools
7. Documentation and examples

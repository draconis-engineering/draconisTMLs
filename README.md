# Draconis Training Markup Languages (DTMLs)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

DTMLs are XML-based markup languages for describing triathlon training sessions in a machine-readable, human-friendly format. Part of the Draconis ecosystem, used by [Olympus](https://github.com/draconis-engineering/olympus).

## Languages

| Language | Extension | Purpose | Status |
|----------|-----------|---------|--------|
| **DSML** (Draconis Swimming Markup Language) | `.dsml.xml` | Swimming sessions | In Development |
| **DRML** (Draconis Running Markup Language) | `.drml.xml` | Running sessions | In Development |
| **DCML** (Draconis Cycling Markup Language) | `.dcml.xml` | Cycling sessions | In Development |
| **DTIR** (Draconis Training Intermediate Representation) | `.dtir.xml` | Normalized common format for all sports | In Development |

## Quick Start

### Installation

```bash
npm install
npm run build
```

### Validation

```bash
npx ts-node tools/validate.ts src/dsml/example.dsml.xml
```

### Using the API

```typescript
import { DTMLParser, DTMLValidator, DTIRTransformer } from '@draconis/tmml';

const parser = new DTMLParser();
const session = parser.parseFile('session.dsml.xml');

const validator = new DTMLValidator();
const result = validator.validateFile('session.dsml.xml');
console.log(result.valid ? 'Valid' : 'Invalid');
```

## Features

- **XML-based schemas** - XSD validation for each sport language
- **Sport-specific semantics** - Natural expressions for swim, run, and bike
- **Intermediate representation** - DTIR normalizes all sports to a common format
- **Extensible architecture** - Easy to add new sports or features
- **TypeScript types** - Full type definitions for all constructs

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - Design and structure
- [Roadmap](docs/ROADMAP.md) - Development plan
- [Schemas](schemas/) - XSD schema definitions

## Example (DSML)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<swimsession id="dsml_0000" xmlns="https://draconis.engineering/dtml/dsml">
    <config>
        <pool lengthMeters="25"/>
        <gear paddles="true"/>
    </config>
    <warmup>
        <drillset>
            <superman lengthMeters="100"/>
            <rest lengthSeconds="30"/>
        </drillset>
    </warmup>
    <main>
        <repeat count="5">
            <freestyle lengthMeters="200" RPE="8"/>
            <rest lengthSeconds="30"/>
        </repeat>
    </main>
</swimsession>
```

## Contributing

Contributions are welcome! See [CONTRIBUTING](.github/CODEOWNERS) for guidelines.

## License

[MIT](LICENSE)

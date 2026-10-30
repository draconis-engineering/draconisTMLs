# DTML Specification

**Version:** 0.1.0  
**Status:** Draft

Draconis Training Markup Languages (DTMLs) are XML-based formats for describing triathlon training sessions in a machine-readable, human-friendly way.

## Table of Contents

- [Overview](#overview)
- [Common Conventions](#common-conventions)
- [DSML (Swimming)](#dsml-draconis-swimming-markup-language)
- [DRML (Running)](#drml-draconis-running-markup-language)
- [DCML (Cycling)](#dcml-draconis-cycling-markup-language)
- [DTIR (Intermediate Representation)](#dtir-draconis-training-intermediate-representation)
- [Validation](#validation)
- [Tools & CLI](#tools--cli)

## Overview

| Language | Root Element | File Extension | Purpose |
| --- | --- | --- | --- |
| DSML | `<swimsession>` | `.dsml.xml` | Swimming sessions |
| DRML | `<runsession>` | `.drml.xml` | Running sessions |
| DCML | `<bikesession>` | `.dcml.xml` | Cycling sessions |
| DTIR | `<training>` | `.dtir.xml` | Normalized format for all sports |

All schemas are defined in the [schemas/](../schemas/) directory using XML Schema (XSD).

## Common Conventions

### Session Structure

All sport sessions follow a consistent phase structure:

1. **`<presession>`** (optional) - Pre-session activities
2. **`<warmup>`** (optional) - Warm-up activities  
3. **`<main>`** (required) - Main set/workout
4. **`<cooldown>`** (optional) - Cool-down activities
5. **`<postsession>`** (optional) - Post-session activities

### Units

- **Distance:** Meters (`lengthMeters`), Yards (`lengthYards`), Kilometers (`distanceKm`), Miles (`distanceMiles`)
- **Duration:** Seconds (`durationSeconds`, `lengthSeconds`), Minutes (`durationMinutes`, `lengthMinutes`), Hours (`durationHours`)
- **Intensity:** RPE (1-10, `RPE`), Heart Rate (`HR`), Pace (`pace`), Power in watts (`power`), FTP percentage (`FTPpct`/`ftpPct`)

### Common Attributes

All session roots support: `id` (required), `name`, `date`, `version`

## DSML (Draconis Swimming Markup Language)

Namespace: `https://draconis.engineering/dtml/dsml`

### Root Element: `<swimsession>`

```xml
<swimsession id="dsml_0000" xmlns="https://draconis.engineering/dtml/dsml">
  <config>...</config>
  <metadata>...</metadata>
  <warmup>...</warmup>
  <main>...</main>
</swimsession>
```

### Configuration

```xml
<config>
  <pool lengthMeters="25" laneWidthMeters="5" depthMeters="1.5" indoor="true"/>
  <gear paddles="true" fins="true" snorkel="true" pullbuoy="false" kickboard="false" bands="false"/>
</config>
```

### Stroke Elements

| Element | Description | Common Attributes |
| --- | --- | --- |
| `<freestyle>`, `<backstroke>`, `<breaststroke>`, `<butterfly>` | Specific strokes | `lengthMeters`, `lengthYards`, `durationSeconds`, `durationMinutes`, `RPE`, `pace`, equipment flags, `notes` |
| `<swim>` | Generic swim (defaults to freestyle) | Same as above |
| `<medley>` | Medley swim | `lengthMeters`, `order`, `RPE` |

### Drills

```xml
<drillset>
  <drill name="catch-up" lengthMeters="50"/>
  <superman lengthMeters="25"/>
</drillset>
```

| Element | Description | Attributes |
| --- | --- | --- |
| `<drill>` | Drill with optional name | `name`, `lengthMeters`, `lengthYards`, `durationSeconds`, `durationMinutes`, `RPE`, `notes` |
| `<superman>` | Superman drill (shortcut) | Same as drill |

### Repeats

```xml
<repeat count="4">
  <freestyle lengthMeters="100" RPE="7"/>
  <rest lengthSeconds="15"/>
</repeat>
```

Repeats can contain: `drillset`, strokes, `medley`, `drill`, `swim`, `rest`

### Other Elements

| Element | Description | Attributes |
| --- | --- | --- |
| `<rest>` | Rest period | `lengthSeconds`, `lengthMinutes`, `lengthHours`, `notes` |
| `<bandWork>` | Band work | `durationMinutes`, `durationSeconds`, `RPE` |
| `<sauna>` | Sauna session | `durationMinutes`, `temperatureCelsius` |

### Complete Example

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
  <cooldown>
    <freestyle lengthMeters="200"/>
  </cooldown>
</swimsession>
```

## DRML (Draconis Running Markup Language)

Namespace: `https://draconis.engineering/dtml/drml`

### Root Element: `<runsession>`

### Configuration

```xml
<config>
  <location type="road" surface="asphalt" elevation="100"/>
  <gear shoes="pegasus" watch="true"/>
</config>
```

**Location types:** `road`, `trail`, `track`, `treadmill`, `crosscountry`  
**Surface types:** `asphalt`, `concrete`, `gravel`, `dirt`, `grass`, `track`, `treadmill`

### Run Elements

| Element | Description | Attributes |
| --- | --- | --- |
| `<run>` | Generic run | `distanceKm`, `distanceMiles`, `durationMinutes`, `durationSeconds`, `pace`, `HR`, `RPE`, `notes` |
| `<easy>` | Easy pace run | Same as run |
| `<tempo>` | Tempo run | Same as run |
| `<threshold>` | Threshold run | Same as run |
| `<walk>` | Walking | `distanceKm`, `durationMinutes` |
| `<strides>` | Strides | `count`, `distanceMeters`, `RPE` |
| `<drills>` | Running drills | `name`, `durationMinutes`, `notes` |

### Intervals

```xml
<intervals repeats="6">
  <work distanceKm="0.4" RPE="9"/>
  <rest durationSeconds="60" type="jog"/>
</intervals>
```

**Rest types:** `static`, `walk`, `jog`

### Repeats

```xml
<repeats count="3">
  <run distanceKm="1" RPE="7"/>
  <rest durationSeconds="90"/>
</repeats>
```

### Complete Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<runsession id="drml_0000" xmlns="https://draconis.engineering/dtml/drml">
  <config>
    <location type="road" surface="asphalt"/>
    <gear shoes="pegasus" watch="true"/>
  </config>
  <warmup>
    <easy distanceKm="1"/>
    <strides count="4" distanceMeters="100"/>
  </warmup>
  <main>
    <repeats count="3">
      <run distanceKm="1" RPE="7"/>
      <rest durationSeconds="60" type="jog"/>
    </repeats>
    <tempo durationMinutes="10" RPE="8"/>
  </main>
  <cooldown>
    <easy distanceKm="1"/>
  </cooldown>
</runsession>
```

## DCML (Draconis Cycling Markup Language)

Namespace: `https://draconis.engineering/dtml/dcml`

### Root Element: `<bikesession>`

### Configuration

```xml
<config>
  <trainer type="smart" resistanceMode="erg"/>
  <bike name="my-bike" ftp="250"/>
</config>
```

**Trainer types:** `smart`, `wheel-on`, `direct-drive`, `fluid`, `magnetic`  
**Resistance modes:** `erg`, `sim`, `level`, `resistance`

### Ride Elements

| Element | Description | Attributes |
| --- | --- | --- |
| `<ride>` | Generic ride | `distanceKm`, `durationMinutes`, `durationSeconds`, `power`, `cadence`, `FTPpct`, `RPE`, `HR`, `notes` |
| `<warm>`, `<easy>`, `<steady>`, `<threshold>`, `<sweetspot>`, `<vo2>` | Ride with specific intensity | Same as ride |

### Intervals

```xml
<intervals repeats="5">
  <work durationMinutes="1" FTPpct="90" cadence="95"/>
  <rest durationSeconds="30" FTPpct="55"/>
</intervals>
```

### Blocks

Blocks group multiple activities and can be repeated:

```xml
<blocks repeats="3">
  <intervals repeats="5">
    <work durationMinutes="1" FTPpct="90"/>
    <rest durationSeconds="30" FTPpct="55"/>
  </intervals>
  <rest durationMinutes="2" FTPpct="55"/>
</blocks>
```

### Rest

```xml
<rest durationMinutes="5" FTPpct="50"/>
```

### Complete Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<bikesession id="dcml_0000" xmlns="https://draconis.engineering/dtml/dcml">
  <config>
    <trainer type="smart" resistanceMode="erg"/>
    <bike ftp="250"/>
  </config>
  <warmup>
    <warm durationMinutes="10" FTPpct="60"/>
  </warmup>
  <main>
    <blocks repeats="3">
      <intervals repeats="5">
        <work durationMinutes="1" FTPpct="90"/>
        <rest durationSeconds="30" FTPpct="55"/>
      </intervals>
      <rest durationMinutes="2" FTPpct="55"/>
    </blocks>
  </main>
  <cooldown>
    <easy durationMinutes="10" FTPpct="60"/>
  </cooldown>
</bikesession>
```

## DTIR (Draconis Training Intermediate Representation)

Namespace: `https://draconis.engineering/dtml/dtir`

DTIR is a normalized, sport-agnostic representation. All durations are normalized to seconds and distances to meters where possible.

### Root Element: `<training>`

```xml
<training id="..." sport="swim|run|bike">
  <metadata>...</metadata>
  <session>
    <phases>
      <phase name="..." order="0">
        <blocks>...</blocks>
      </phase>
    </phases>
  </session>
</training>
```

### Block Types

- **`<continuous>`** - Continuous work, optional repeat
- **`<set>`** - Set of work with optional rest, can be repeated

```xml
<blocks>
  <set repeat="5">
    <work name="freestyle" stroke="freestyle">
      <metrics distanceMeters="200" durationSeconds="180" rpe="8"/>
      <equipment paddles="false"/>
    </work>
    <rest durationSeconds="30"/>
  </set>
</blocks>
```

## Validation

### Using CLI
```bash
dtml validate examples/example.dsml.xml
dtml check examples/example.drml.xml
```

### Using API
```typescript
import { DTMLValidator } from "@draconis/tmml";
const validator = new DTMLValidator();
const result = validator.validateFile("session.dsml.xml");
console.log(result.valid);
```

### XSD Validation
All files can be validated against XSD schemas in `schemas/` using tools like `xmllint`, `libxmljs2`, or `xmlschema`.

## Tools & CLI

The `dtml` CLI provides various operations:

```bash
# Validation
dtml validate <file>        # Validate DTML file
dtml check <file>           # Alias for validate

# Conversion & Parsing
dtml parse <file>           # Parse and output JSON
dtml to-json <file>         # Convert to JSON
dtml convert <file> --to dtir   # Convert to DTIR
dtml convert <file> --to json   # Convert to JSON

# Formatting
dtml format <file>          # Normalize/pretty print XML in place
```

### Programmatic API

```typescript
import { DTMLParser, DTMLValidator, DTIRTransformer, DSMLParser, DSMLWriter } from "@draconis/tmml";

// Parse
const parser = new DSMLParser();
const session = parser.parseFile("session.dsml.xml");

// Validate
const validator = new DTMLValidator();
const result = validator.validateFile("session.dsml.xml");

// Write/Round-trip
const writer = new DSMLWriter();
const xml = writer.write(session);

// Transform to DTIR
const transformer = new DTIRTransformer();
const dtir = transformer.toDTIR(session);
```

## See Also

- [schemas/](../schemas/) - XSD schema definitions
- [examples/](../examples/) - Example files for all languages
- [README.md](../README.md) - Project overview
- [PATH_TO_V1.md](PATH_TO_V1.md) - Development roadmap

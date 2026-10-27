# DTML Specification (Draft)

This document provides a human-readable overview of Draconis Training Markup Languages (DTMLs).

## Languages
- DSML (Draconis Swimming Markup Language) - `swimsession` root
- DRML (Draconis Running Markup Language) - `runsession` root
- DCML (Draconis Cycling Markup Language) - `bikesession` root
- DTIR (Draconis Training Intermediate Representation) - `training` root

## Common Structure
All sport sessions follow: `config`, `presession`, `warmup`, `main` (required), `cooldown`, `postsession`.

## Validation
Use `dtml validate <file>` or `npm run validate -- <file>`. XSD schemas are in `schemas/`.

## Parsing/Writing/Conversion
- `dtml parse/to-json <file>` - Parse to JSON
- `dtml convert <file> --to dtir` - Convert to DTIR
- `dtml format <file>` - Normalize/pretty print XML
- `dtml check <file>` - Validate

See schemas for full element/attribute details.

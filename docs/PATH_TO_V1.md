# Path to v1.0 - Missing Pieces & Plan

This document outlines what is missing from DraconisTMLs to make it genuinely useful, and a concrete plan to reach v1.0.

## What's Missing

### Critical (Needed for v1.0 Usability)

| Area                       | Status            | What Needs to Be Done                                                                                                                                                                                                                              | Priority |
| :------------------------- | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| **Sport-Specific Parsers** | Stubbed           | The parser currently just uses `fast-xml-parser` and dumps raw objects. We need parsers that map to the TypeScript types (e.g. `SwimSession`, `RunSession`, `BikeSession`), normalize units (m/yd, s/min), and handle defaults from schemas.       | P0       |
| **Writers/Serializers**    | Missing           | Round-tripping is essential. Need to be able to take the typed objects and serialize them back to valid, schema-conforming XML. This is needed for any programmatic generation of plans.                                                           | P0       |
| **DTIR Transformation**    | Partially Stubbed | `swimToDTIR` is started, but `runToDTIR` and `bikeToDTIR` just create empty phases. Need concrete mapping rules for every element, proper duration/distance normalization, and handling of repeats/intervals. This is the key to interoperability. | P0       |
| **Complete Examples**      | Partial           | Only DSML has a fleshed out example. DRML and DCML need valid examples that match their schemas. Right now tests only validate DSML and check existence, which isn't enough to prove the schemas are usable.                                       | P0       |

### High Value (Greatly Improves DX)

| Area                     | Status  | What Needs to Be Done                                                                                                                                                                     | Priority |
| :----------------------- | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| **Better Validation UX** | Basic   | The XSD errors are pretty raw. We should surface line/column numbers, human-readable messages (e.g. "missing required attribute `id` on `<swimsession>`"), and hints for common mistakes. | P1       |
| **CLI Expansion**        | Minimal | Right now only `validate`. I'd add `dtml convert <file> --to dtir`, `dtml to-json <file>`, `dtml format <file>` (pretty print/normalize), and `dtml check` as a convenience command.      | P1       |
| **JSON Support**         | Missing | A lot of tooling wants JSON. We should be able to serialize the typed AST to JSON, have JSON Schema definitions, and potentially parse JSON as an input format as well.                   | P1       |
| **Human Readable Spec**  | Missing | XSD is machine readable, but not approachable. A `docs/SPEC.md` with examples, element references, and explanations would go a long way for adoption.                                     | P1       |

### Nice To Have (For Long Term)

| Area                    | Status    | What Needs to Be Done                                                                                                                                                                   | Priority |
| :---------------------- | :-------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| **Plaintext Parsers**   | Planned   | The roadmap mentions this. Could be useful for coaches that want to write in a more compact format and compile to DTML. Probably worth designing the grammar first before implementing. | P2       |
| **Triathlon Sessions**  | Unplanned | Right now languages are per-sport. A combined session (swim/bike/run with transitions) would be a natural extension, possibly as its own format or composed via DTIR.                   | P2       |
| **More Robust Testing** | Minimal   | Tests only cover the DSML example. We need tests for validation failures, round-trip (parse->write->validate), DTIR transforms, and edge cases (repeats, units, etc).                   | P2       |

## Recommended Plan

Tackle this in order to get the most utility with the least amount of rework:

### Phase A: Make Parsing/Serialization Useful (1-2 weeks)

1. [x] **Flesh out DSML parser first** - Implement a mapper from the parsed XML to `SwimSession` objects using the types we have. Handle attribute coercion, defaults, and nested structures (repeats/drillsets).
2. [x] **Add writers** - Create a `SwimWriter` that takes `SwimSession` objects and emits valid XML (ideally able to pass XSD validation). This proves our object model is correct.
3. [x] **Add round-trip tests** - `parse(example) -> write -> validate` should succeed. This is a great regression test.

### Phase B: Normalize Everything (1-2 weeks)

4. [x] **Complete DTIR transformer** - Finish `runToDTIR` and `bikeToDTIR`. Define the normalization rules (e.g. all durations converted to seconds, all distances to meters) and ensure nothing is lost.
5. [x] **Add DRML/DCML examples + parsers** - Mirror Phase A for the other sports. This will stress test the schemas and types and likely reveal missing pieces.

### Phase C: Polish For Adoption (Ongoing)

6. [ ] **Expand CLI** - Add `convert` and `to-json` commands that use the parsers/transformers/writers. This is what most people will actually use.
7. [ ] **Improve errors + docs** - Add `SPEC.md`, improve validation messages, and add more examples.
8. [ ] **Harden tests** - Expand coverage to all languages, add failure case tests, and integrate into CI.

**Recommendation:** Start with Phase A, specifically the DSML round-trip. We already have a perfect test subject with the example, XSD validation works, and types are defined. Getting parse->write to work will validate our entire architecture, flush out any schema issues, and immediately make the library useful programmatically.

#!/usr/bin/env node
import { DTMLValidator } from "../src/validators";
import * as path from "path";

const args: any = (process.argv as any).slice
  ? (process.argv as any).slice(2)
  : [];
if (!Array.isArray(args)) {
  console.log(
    "Usage: validate [--xsd-only] <file.dsml.xml|file.drml.xml|file.dcml.xml|file.dtir.xml>",
  );
  process.exit(1);
}

if (args.length === 0) {
  console.log(
    "Usage: validate [--xsd-only] <file.dsml.xml|file.drml.xml|file.dcml.xml|file.dtir.xml>",
  );
  process.exit(1);
}

const xsdOnly = (args as any).indexOf
  ? (args as any).indexOf("--xsd-only") >= 0
  : args.includes("--xsd-only");
let fileArg: any = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] && !(args[i] as string).startsWith("--")) {
    fileArg = args[i];
    break;
  }
}

if (!fileArg) {
  console.log("Usage: validate [--xsd-only] <file>");
  process.exit(1);
}

const validator = new DTMLValidator();
const filePath = path.resolve(fileArg);

if (xsdOnly) {
  const result = (validator as any).validateXSD(filePath);
  if (result.valid) {
    console.log(`✓ ${path.basename(filePath)} is XSD valid`);
    process.exit(0);
  } else {
    console.log(`✗ ${path.basename(filePath)} has XSD errors:`);
    (result.errors || []).forEach((err: any) => console.log(`  - ${err}`));
    process.exit(1);
  }
}

const result = validator.validateFile(filePath);
const t = result.type ? String(result.type).toUpperCase() : "";
console.log(t ? "[" + t + "]" : "");
if (result.valid) {
  console.log(`✓ ${path.basename(filePath)} is valid`);
  if ((result as any).xsdValid === true) console.log(`  (XSD validated)`);
  else if ((result as any).xsdValid === false)
    console.log(`  (XSD validation had issues - see above)`);
  process.exit(0);
} else {
  console.log(`✗ ${path.basename(filePath)} has errors:`);
  (result.errors || []).forEach((err: any) => console.log(`  - ${err}`));
  process.exit(1);
}

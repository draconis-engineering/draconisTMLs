const { DTMLValidator } = require("./src/validators");
const path = require("path");
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: node validate.js <file>");
  process.exit(1);
}
const validator = new DTMLValidator();
const filePath = path.resolve(args[0]);
const result = validator.validateFile(filePath);
if (result.type) {
  console.log("[" + result.type.toUpperCase() + "]");
}
if (result.valid) {
  console.log("✓ " + path.basename(filePath) + " is valid");
  if (result.xsdValid === true) {
    console.log("  (XSD validated)");
  }
  process.exit(0);
} else {
  console.log("✗ " + path.basename(filePath) + " has errors:");
  const errs = result.errors || [];
  for (var i = 0; i < errs.length; i++) {
    console.log("  - " + errs[i]);
  }
  process.exit(1);
}

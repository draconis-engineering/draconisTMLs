#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const validators_1 = require("../src/validators");
const path = __importStar(require("path"));
const args = process.argv.slice
    ? process.argv.slice(2)
    : [];
if (!Array.isArray(args)) {
    console.log("Usage: validate [--xsd-only] <file.dsml.xml|file.drml.xml|file.dcml.xml|file.dtir.xml>");
    process.exit(1);
}
if (args.length === 0) {
    console.log("Usage: validate [--xsd-only] <file.dsml.xml|file.drml.xml|file.dcml.xml|file.dtir.xml>");
    process.exit(1);
}
const xsdOnly = args.indexOf
    ? args.indexOf("--xsd-only") >= 0
    : args.includes("--xsd-only");
let fileArg = null;
for (let i = 0; i < args.length; i++) {
    if (args[i] && !args[i].startsWith("--")) {
        fileArg = args[i];
        break;
    }
}
if (!fileArg) {
    console.log("Usage: validate [--xsd-only] <file>");
    process.exit(1);
}
const validator = new validators_1.DTMLValidator();
const filePath = path.resolve(fileArg);
if (xsdOnly) {
    const result = validator.validateXSD(filePath);
    if (result.valid) {
        console.log(`✓ ${path.basename(filePath)} is XSD valid`);
        process.exit(0);
    }
    else {
        console.log(`✗ ${path.basename(filePath)} has XSD errors:`);
        (result.errors || []).forEach((err) => console.log(`  - ${err}`));
        process.exit(1);
    }
}
const result = validator.validateFile(filePath);
const t = result.type ? String(result.type).toUpperCase() : "";
console.log(t ? "[" + t + "]" : "");
if (result.valid) {
    console.log(`✓ ${path.basename(filePath)} is valid`);
    if (result.xsdValid === true)
        console.log(`  (XSD validated)`);
    else if (result.xsdValid === false)
        console.log(`  (XSD validation had issues - see above)`);
    process.exit(0);
}
else {
    console.log(`✗ ${path.basename(filePath)} has errors:`);
    (result.errors || []).forEach((err) => console.log(`  - ${err}`));
    process.exit(1);
}

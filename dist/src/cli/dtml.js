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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const validators_1 = require("../validators");
const dsml_1 = require("../parsers/dsml");
const drml_1 = require("../parsers/drml");
const dcml_1 = require("../parsers/dcml");
const dsml_2 = require("../writers/dsml");
const drml_2 = require("../writers/drml");
const dcml_2 = require("../writers/dcml");
const dtir_1 = require("../transformers/dtir");
function usage() {
    console.log(`Usage: dtml <command> [options]

Commands:
  validate <file>        Validate a DTML file
  check <file>           Same as validate
  convert <file> --to dtir|json
  to-json <file>         Convert DTML to JSON
  format <file>          Pretty print/normalize XML
  parse <file>           Parse and output JSON representation
`);
    process.exit(1);
}
function detectType(file, content) {
    const name = path.basename(file).toLowerCase();
    if (name.includes('.dsml.'))
        return 'dsml';
    if (name.includes('.drml.'))
        return 'drml';
    if (name.includes('.dcml.'))
        return 'dcml';
    if (name.includes('.dtir.'))
        return 'dtir';
    if (content.includes('<swimsession'))
        return 'dsml';
    if (content.includes('<runsession'))
        return 'drml';
    if (content.includes('<bikesession'))
        return 'dcml';
    if (content.includes('<training'))
        return 'dtir';
    return null;
}
function main() {
    const args = process.argv.slice(2);
    if (args.length === 0)
        return usage();
    const cmd = args[0];
    if (cmd === 'validate' || cmd === 'check') {
        const validator = new validators_1.DTMLValidator();
        const file = args[1];
        if (!file)
            return usage();
        const res = validator.validateFile(path.resolve(file));
        const t = res.type ? String(res.type).toUpperCase() : '';
        console.log(t ? '[' + t + ']' : '');
        if (res.valid) {
            console.log(`✓ ${path.basename(file)} is valid`);
            if (res.xsdValid === true)
                console.log(`  (XSD validated)`);
            process.exit(0);
        }
        else {
            console.log(`✗ ${path.basename(file)} has errors:`);
            (res.errors || []).forEach((err) => console.log(`  - ${err}`));
            process.exit(1);
        }
    }
    else if (cmd === 'to-json' || cmd === 'parse') {
        const file = args[1];
        if (!file)
            return usage();
        const p = path.resolve(file);
        const content = fs.readFileSync(p, 'utf-8');
        const type = detectType(p, content);
        if (type === 'dsml') {
            const parser = new dsml_1.DSMLParser();
            const parsed = parser.parseFile(p);
            console.log(JSON.stringify(parsed, null, 2));
            process.exit(0);
        }
        else if (type === 'drml') {
            const parser = new drml_1.DRMLParser();
            const parsed = parser.parseFile(p);
            console.log(JSON.stringify(parsed, null, 2));
            process.exit(0);
        }
        else if (type === 'dcml') {
            const parser = new dcml_1.DCMLParser();
            const parsed = parser.parseFile(p);
            console.log(JSON.stringify(parsed, null, 2));
            process.exit(0);
        }
        console.log('Unsupported or unknown type');
        process.exit(1);
    }
    else if (cmd === 'format') {
        const file = args[1];
        if (!file)
            return usage();
        const p = path.resolve(file);
        const content = fs.readFileSync(p, 'utf-8');
        const type = detectType(p, content);
        if (type === 'dsml') {
            const parser = new dsml_1.DSMLParser();
            const writer = new dsml_2.DSMLWriter();
            const parsed = parser.parseFile(p);
            const out = writer.write(parsed);
            fs.writeFileSync(p, out);
            console.log(`✓ Formatted ${path.basename(p)}`);
            process.exit(0);
        }
        else if (type === 'drml') {
            const parser = new drml_1.DRMLParser();
            const writer = new drml_2.DRMLWriter();
            const parsed = parser.parseFile(p);
            const out = writer.write(parsed);
            fs.writeFileSync(p, out);
            console.log(`✓ Formatted ${path.basename(p)}`);
            process.exit(0);
        }
        else if (type === 'dcml') {
            const parser = new dcml_1.DCMLParser();
            const writer = new dcml_2.DCMLWriter();
            const parsed = parser.parseFile(p);
            const out = writer.write(parsed);
            fs.writeFileSync(p, out);
            console.log(`✓ Formatted ${path.basename(p)}`);
            process.exit(0);
        }
        console.log('Unsupported or unknown type');
        process.exit(1);
    }
    else if (cmd === 'convert') {
        const file = args[1];
        if (!file)
            return usage();
        let to = 'dtir';
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '--to' && args[i + 1])
                to = args[i + 1];
        }
        const p = path.resolve(file);
        const content = fs.readFileSync(p, 'utf-8');
        const type = detectType(p, content);
        if (to === 'json') {
            if (type === 'dsml') {
                const parser = new dsml_1.DSMLParser();
                console.log(JSON.stringify(parser.parseFile(p), null, 2));
                process.exit(0);
            }
            else if (type === 'drml') {
                const parser = new drml_1.DRMLParser();
                console.log(JSON.stringify(parser.parseFile(p), null, 2));
                process.exit(0);
            }
            else if (type === 'dcml') {
                const parser = new dcml_1.DCMLParser();
                console.log(JSON.stringify(parser.parseFile(p), null, 2));
                process.exit(0);
            }
        }
        else if (to === 'dtir') {
            const transformer = new dtir_1.DTIRTransformer();
            if (type === 'dsml') {
                const parser = new dsml_1.DSMLParser();
                const parsed = parser.parseFile(p);
                const dtir = transformer.toDTIR(parsed);
                console.log(JSON.stringify(dtir, null, 2));
                process.exit(0);
            }
            else if (type === 'drml') {
                const parser = new drml_1.DRMLParser();
                const parsed = parser.parseFile(p);
                const dtir = transformer.toDTIR(parsed);
                console.log(JSON.stringify(dtir, null, 2));
                process.exit(0);
            }
            else if (type === 'dcml') {
                const parser = new dcml_1.DCMLParser();
                const parsed = parser.parseFile(p);
                const dtir = transformer.toDTIR(parsed);
                console.log(JSON.stringify(dtir, null, 2));
                process.exit(0);
            }
        }
        console.log('Unsupported conversion');
        process.exit(1);
    }
    else {
        usage();
    }
}
main();

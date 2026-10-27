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
const dsml_1 = require("../src/parsers/dsml");
const dsml_2 = require("../src/writers/dsml");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
describe('DTML Examples', () => {
    const validator = new validators_1.DTMLValidator();
    test('DSML example validates', () => {
        const examplePath = fs.existsSync(path.join(__dirname, '../examples/example.dsml.xml'))
            ? path.join(__dirname, '../examples/example.dsml.xml')
            : path.join(__dirname, '../src/dsml/example.dsml.xml');
        const result = validator.validateFile(examplePath);
        expect(result.valid).toBe(true);
    });
    test('DSML round-trip parse -> write -> validate', () => {
        const examplePath = fs.existsSync(path.join(__dirname, '../examples/example.dsml.xml'))
            ? path.join(__dirname, '../examples/example.dsml.xml')
            : path.join(__dirname, '../src/dsml/example.dsml.xml');
        const parser = new dsml_1.DSMLParser();
        const writer = new dsml_2.DSMLWriter();
        const parsed = parser.parseFile(examplePath);
        const out = writer.write(parsed);
        const tmp = path.join(os.tmpdir(), `dsml_rt_${Date.now()}.xml`);
        fs.writeFileSync(tmp, out);
        const result = validator.validateFile(tmp);
        try {
            fs.unlinkSync(tmp);
        }
        catch (e) { }
        expect(result.valid).toBe(true);
    });
    test('DRML round-trip parse -> write -> validate', () => {
        const { DRMLParser } = require('../src/parsers/drml');
        const { DRMLWriter } = require('../src/writers/drml');
        const parser = new DRMLParser();
        const writer = new DRMLWriter();
        const parsed = parser.parseFile(path.join(__dirname, '../examples/example.drml.xml'));
        const out = writer.write(parsed);
        const tmp = path.join(os.tmpdir(), `drml_rt_${Date.now()}.xml`);
        fs.writeFileSync(tmp, out);
        const result = validator.validateFile(tmp);
        try {
            fs.unlinkSync(tmp);
        }
        catch (e) { }
        expect(result.valid).toBe(true);
    });
    test('DCML round-trip parse -> write -> validate', () => {
        const { DCMLParser } = require('../src/parsers/dcml');
        const { DCMLWriter } = require('../src/writers/dcml');
        const parser = new DCMLParser();
        const writer = new DCMLWriter();
        const parsed = parser.parseFile(path.join(__dirname, '../examples/example.dcml.xml'));
        const out = writer.write(parsed);
        const tmp = path.join(os.tmpdir(), `dcml_rt_${Date.now()}.xml`);
        fs.writeFileSync(tmp, out);
        const result = validator.validateFile(tmp);
        try {
            fs.unlinkSync(tmp);
        }
        catch (e) { }
        expect(result.valid).toBe(true);
    });
    test('DRML example validates', () => {
        const examplePath = path.join(__dirname, '../examples/example.drml.xml');
        const result = validator.validateFile(examplePath);
        expect(result.valid).toBe(true);
    });
    test('DCML example validates', () => {
        const examplePath = path.join(__dirname, '../examples/example.dcml.xml');
        const result = validator.validateFile(examplePath);
        expect(result.valid).toBe(true);
    });
    test('All example files exist', () => {
        const dsmlExample = fs.existsSync(path.join(__dirname, '../examples/example.dsml.xml')) || fs.existsSync(path.join(__dirname, '../src/dsml/example.dsml.xml'));
        const drmlExample = fs.existsSync(path.join(__dirname, '../examples/example.drml.xml')) || fs.existsSync(path.join(__dirname, '../src/drml/example.drml.xml'));
        const dcmlExample = fs.existsSync(path.join(__dirname, '../examples/example.dcml.xml'));
        expect(dsmlExample).toBe(true);
        expect(drmlExample).toBe(true);
        expect(dcmlExample).toBe(true);
    });
});

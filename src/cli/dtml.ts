#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { DTMLValidator } from '../validators';
import { DSMLParser } from '../parsers/dsml';
import { DRMLParser } from '../parsers/drml';
import { DCMLParser } from '../parsers/dcml';
import { DSMLWriter } from '../writers/dsml';
import { DRMLWriter } from '../writers/drml';
import { DCMLWriter } from '../writers/dcml';
import { DTIRTransformer } from '../transformers/dtir';

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

function detectType(file: string, content: string): 'dsml' | 'drml' | 'dcml' | 'dtir' | null {
	const name = path.basename(file).toLowerCase();
	if (name.includes('.dsml.')) return 'dsml';
	if (name.includes('.drml.')) return 'drml';
	if (name.includes('.dcml.')) return 'dcml';
	if (name.includes('.dtir.')) return 'dtir';
	if (content.includes('<swimsession')) return 'dsml';
	if (content.includes('<runsession')) return 'drml';
	if (content.includes('<bikesession')) return 'dcml';
	if (content.includes('<training')) return 'dtir';
	return null;
}

function main() {
	const args = process.argv.slice(2);
	if (args.length === 0) return usage();
	const cmd = args[0];

	if (cmd === 'validate' || cmd === 'check') {
		const validator = new DTMLValidator();
		const file = args[1];
		if (!file) return usage();
		const res = validator.validateFile(path.resolve(file));
		const t = res.type ? String(res.type).toUpperCase() : '';
		console.log(t ? '[' + t + ']' : '');
		if (res.valid) {
			console.log(`✓ ${path.basename(file)} is valid`);
			if ((res as any).xsdValid === true) console.log(`  (XSD validated)`);
			process.exit(0);
		} else {
			console.log(`✗ ${path.basename(file)} has errors:`);
			(res.errors || []).forEach((err: any) => console.log(`  - ${err}`));
			process.exit(1);
		}
	} else if (cmd === 'to-json' || cmd === 'parse') {
		const file = args[1];
		if (!file) return usage();
		const p = path.resolve(file);
		const content = fs.readFileSync(p, 'utf-8');
		const type = detectType(p, content);
		if (type === 'dsml') {
			const parser = new DSMLParser();
			const parsed = parser.parseFile(p);
			console.log(JSON.stringify(parsed, null, 2));
			process.exit(0);
		} else if (type === 'drml') {
			const parser = new DRMLParser();
			const parsed = parser.parseFile(p);
			console.log(JSON.stringify(parsed, null, 2));
			process.exit(0);
		} else if (type === 'dcml') {
			const parser = new DCMLParser();
			const parsed = parser.parseFile(p);
			console.log(JSON.stringify(parsed, null, 2));
			process.exit(0);
		}
		console.log('Unsupported or unknown type');
		process.exit(1);
	} else if (cmd === 'format') {
		const file = args[1];
		if (!file) return usage();
		const p = path.resolve(file);
		const content = fs.readFileSync(p, 'utf-8');
		const type = detectType(p, content);
		if (type === 'dsml') {
			const parser = new DSMLParser();
			const writer = new DSMLWriter();
			const parsed = parser.parseFile(p);
			const out = writer.write(parsed);
			fs.writeFileSync(p, out);
			console.log(`✓ Formatted ${path.basename(p)}`);
			process.exit(0);
		} else if (type === 'drml') {
			const parser = new DRMLParser();
			const writer = new DRMLWriter();
			const parsed = parser.parseFile(p);
			const out = writer.write(parsed);
			fs.writeFileSync(p, out);
			console.log(`✓ Formatted ${path.basename(p)}`);
			process.exit(0);
		} else if (type === 'dcml') {
			const parser = new DCMLParser();
			const writer = new DCMLWriter();
			const parsed = parser.parseFile(p);
			const out = writer.write(parsed);
			fs.writeFileSync(p, out);
			console.log(`✓ Formatted ${path.basename(p)}`);
			process.exit(0);
		}
		console.log('Unsupported or unknown type');
		process.exit(1);
	} else if (cmd === 'convert') {
		const file = args[1];
		if (!file) return usage();
		let to = 'dtir';
		for (let i = 0; i < args.length; i++) {
			if (args[i] === '--to' && args[i + 1]) to = args[i + 1];
		}
		const p = path.resolve(file);
		const content = fs.readFileSync(p, 'utf-8');
		const type = detectType(p, content);
		if (to === 'json') {
			if (type === 'dsml') {
				const parser = new DSMLParser();
				console.log(JSON.stringify(parser.parseFile(p), null, 2));
				process.exit(0);
			} else if (type === 'drml') {
				const parser = new DRMLParser();
				console.log(JSON.stringify(parser.parseFile(p), null, 2));
				process.exit(0);
			} else if (type === 'dcml') {
				const parser = new DCMLParser();
				console.log(JSON.stringify(parser.parseFile(p), null, 2));
				process.exit(0);
			}
		} else if (to === 'dtir') {
			const transformer = new DTIRTransformer();
			if (type === 'dsml') {
				const parser = new DSMLParser();
				const parsed = parser.parseFile(p);
				const dtir = transformer.toDTIR(parsed as any);
				console.log(JSON.stringify(dtir, null, 2));
				process.exit(0);
			} else if (type === 'drml') {
				const parser = new DRMLParser();
				const parsed = parser.parseFile(p);
				const dtir = transformer.toDTIR(parsed as any);
				console.log(JSON.stringify(dtir, null, 2));
				process.exit(0);
			} else if (type === 'dcml') {
				const parser = new DCMLParser();
				const parsed = parser.parseFile(p);
				const dtir = transformer.toDTIR(parsed as any);
				console.log(JSON.stringify(dtir, null, 2));
				process.exit(0);
			}
		}
		console.log('Unsupported conversion');
		process.exit(1);
	} else {
		usage();
	}
}

main();

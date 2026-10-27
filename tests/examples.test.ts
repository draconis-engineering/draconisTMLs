import { DTMLValidator } from '../src/validators';
import { DSMLParser } from '../src/parsers/dsml';
import { DSMLWriter } from '../src/writers/dsml';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

describe('DTML Examples', () => {
	const validator = new DTMLValidator();

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
		const parser = new DSMLParser();
		const writer = new DSMLWriter();
		const parsed = parser.parseFile(examplePath);
		const out = writer.write(parsed);
		const tmp = path.join(os.tmpdir(), `dsml_rt_${Date.now()}.xml`);
		fs.writeFileSync(tmp, out);
		const result = validator.validateFile(tmp);
		try { fs.unlinkSync(tmp); } catch (e) {}
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
		try { fs.unlinkSync(tmp); } catch (e) {}
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
		try { fs.unlinkSync(tmp); } catch (e) {}
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

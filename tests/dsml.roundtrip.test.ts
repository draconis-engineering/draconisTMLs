import { DSMLParser } from '../src/parsers/dsml';
import { DSMLWriter } from '../src/writers/dsml';
import { DTMLValidator } from '../src/validators';
import * as fs from 'fs';
import * as path from 'path';

describe('DSML Roundtrip', () => {
	test('parse -> write -> validate', () => {
		const parser = new DSMLParser();
		const writer = new DSMLWriter();
		const validator = new DTMLValidator();
		const examplePath = fs.existsSync(path.join(__dirname, '../examples/example.dsml.xml'))
			? path.join(__dirname, '../examples/example.dsml.xml')
			: path.join(__dirname, '../src/dsml/example.dsml.xml');
		const session = parser.parseFile(examplePath);
		const xml = writer.write(session);
		const outPath = path.join(__dirname, '../out.roundtrip.dsml.xml');
		fs.writeFileSync(outPath, xml);
		const result = validator.validateFile(outPath);
		expect(result.valid).toBe(true);
		try { fs.unlinkSync(outPath); } catch (e) { }
	});
});

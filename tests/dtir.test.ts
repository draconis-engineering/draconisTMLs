import { DSMLParser } from '../src/parsers/dsml';
import { DRMLParser } from '../src/parsers/drml';
import { DCMLParser } from '../src/parsers/dcml';
import { DTIRTransformer } from '../src/transformers/dtir';
import { DTIRWriter } from '../src/writers/dtir';
import { DTMLValidator } from '../src/validators';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('DTIR', () => {
  const validator = new DTMLValidator();
  const transformer = new DTIRTransformer();
  const writer = new DTIRWriter();

  test('DSML converts to valid DTIR', () => {
    const session = new DSMLParser().parseFile(path.join(__dirname, '../examples/example.dsml.xml'));
    const dtir = transformer.toDTIR(session as any);
    const xml = writer.write(dtir);
    const tmp = path.join(os.tmpdir(), `dsml_dtir_${Date.now()}.xml`);
    fs.writeFileSync(tmp, xml);
    const res = validator.validateFile(tmp);
    try { fs.unlinkSync(tmp); } catch (e) {}
    expect(res.errors.filter((e: any) => !String(e).includes('xmllint'))).toEqual([]);
    expect(res.type).toBe('dtir');
  });

  test('DRML converts to valid DTIR', () => {
    const session = new DRMLParser().parseFile(path.join(__dirname, '../examples/example.drml.xml'));
    const dtir = transformer.toDTIR(session as any);
    const xml = writer.write(dtir);
    const tmp = path.join(os.tmpdir(), `drml_dtir_${Date.now()}.xml`);
    fs.writeFileSync(tmp, xml);
    const res = validator.validateFile(tmp);
    try { fs.unlinkSync(tmp); } catch (e) {}
    expect(res.errors.filter((e: any) => !String(e).includes('xmllint'))).toEqual([]);
    expect(res.type).toBe('dtir');
  });

  test('DCML converts to valid DTIR', () => {
    const session = new DCMLParser().parseFile(path.join(__dirname, '../examples/example.dcml.xml'));
    const dtir = transformer.toDTIR(session as any);
    const xml = writer.write(dtir);
    const tmp = path.join(os.tmpdir(), `dcml_dtir_${Date.now()}.xml`);
    fs.writeFileSync(tmp, xml);
    const res = validator.validateFile(tmp);
    try { fs.unlinkSync(tmp); } catch (e) {}
    expect(res.errors.filter((e: any) => !String(e).includes('xmllint'))).toEqual([]);
    expect(res.type).toBe('dtir');
  });
});

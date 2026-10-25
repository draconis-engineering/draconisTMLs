import { DTMLValidator } from '../src/validators';
import * as path from 'path';
import * as fs from 'fs';

describe('DTML Examples', () => {
  const validator = new DTMLValidator();

  test('DSML example validates', () => {
    const examplePath = fs.existsSync(path.join(__dirname, '../examples/example.dsml.xml'))
      ? path.join(__dirname, '../examples/example.dsml.xml')
      : path.join(__dirname, '../src/dsml/example.dsml.xml');
    const result = validator.validateFile(examplePath);
    expect(result.valid).toBe(true);
  });

  test('All example files exist', () => {
    const dsmlExample = fs.existsSync(path.join(__dirname, '../examples/example.dsml.xml')) || fs.existsSync(path.join(__dirname, '../src/dsml/example.dsml.xml'));
    const drmlExample = fs.existsSync(path.join(__dirname, '../examples/example.drml.xml')) || fs.existsSync(path.join(__dirname, '../src/drml/example.drml.xml'));
    expect(dsmlExample).toBe(true);
    expect(drmlExample).toBe(true);
  });
});

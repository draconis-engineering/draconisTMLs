import { BikeSession } from '../types/dcml';

export class DCMLParser {
  parseFile(filePath: string): BikeSession {
    const fs = require('fs');
    const content = fs.readFileSync(filePath, 'utf-8');
    return this.parse(content);
  }

  parse(xml: string): BikeSession {
    const id = xml.match(/id="([^"]+)"/)?.[1] || 'dcml_0000';
    const session: BikeSession = {
      type: 'bikesession',
      metadata: { id: id },
      phases: [],
    };
    return session;
  }
}

export default DCMLParser;

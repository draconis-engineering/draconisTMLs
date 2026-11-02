import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import { RunSession } from '../types/drml';

export class DRMLParser {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '#text',
      parseAttributeValue: true,
      trimValues: true,
    });
  }

  parseFile(filePath: string): RunSession {
    const content = fs.readFileSync(filePath, 'utf-8');
    return this.parse(content);
  }

  parse(xml: string): RunSession {
    const parsed = this.parser.parse(xml);
    const root = parsed.runsession || parsed;
    const id = root.id || root.runsession?.id;
    const session: RunSession = {
      type: 'runsession',
      metadata: { id: id, name: root.name, date: root.date },
      phases: [],
    };

    const phases = ['presession', 'warmup', 'main', 'cooldown', 'postsession'];
    for (let i = 0; i < phases.length; i++) {
      if (root[phases[i]]) {
        session.phases.push({ name: phases[i] as any, activities: [] });
      }
    }
    return session;
  }
}

export default DRMLParser;

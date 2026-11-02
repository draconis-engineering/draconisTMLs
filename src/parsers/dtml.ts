import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';
import { DSMLParser } from './dsml';

export class DTMLParser {
	private parser: XMLParser;
	private dsmlParser: DSMLParser;

	constructor() {
		this.parser = new XMLParser({
			ignoreAttributes: false,
			attributeNamePrefix: '',
			textNodeName: '#text',
			parseAttributeValue: true,
			trimValues: true,
		});
		this.dsmlParser = new DSMLParser();
	}

	parseFile(filePath: string): any {
		const content = fs.readFileSync(filePath, 'utf-8');
		const fileName = path.basename(filePath).toLowerCase();
		if (fileName.includes('.dsml.')) {
			return this.dsmlParser.parseFile(filePath);
		}
		return this.parse(content);
	}

	parse(xml: string): any {
		if (xml && xml.includes('<swimsession')) {
			return this.dsmlParser.parse(xml);
		}
		return this.parser.parse(xml);
	}
}

export { DSMLParser } from './dsml';
export default DTMLParser;

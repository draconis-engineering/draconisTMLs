import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';

export class DTMLParser {
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

	parseFile(filePath: string): any {
		const content = fs.readFileSync(filePath, 'utf-8');
		return this.parse(content);
	}

	parse(xml: string): any {
		return this.parser.parse(xml);
	}
}

export default DTMLParser;

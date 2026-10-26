import * as fs from 'fs';
import * as path from 'path';
import { DTMLParser } from '../parsers/dtml';
import { XSDValidator } from './xsd';

export class DTMLValidator {
	private parser: DTMLParser;
	private xsdValidator: XSDValidator;

	constructor() {
		this.parser = new DTMLParser();
		this.xsdValidator = new XSDValidator();
	}

	validateFile(filePath: string, options: any = {}): any {
		const errors: any[] = [];
		let xsdValid: boolean | undefined;

		try {
			if (!fs.existsSync(filePath)) {
				errors.push('File not found: ' + filePath);
				return { valid: false, errors };
			}

			const content = fs.readFileSync(filePath, 'utf-8');
			const xsdResult = this.xsdValidator.validateFile(filePath);
			xsdValid = xsdResult.valid;
			if (!xsdResult.valid) {
				var errs = xsdResult.errors || [];
				for (var i = 0; i < errs.length; i++) {
					errors.push(errs[i]);
				}
			}

			const parsed = this.parser.parse(content);
			if (!parsed) {
				errors.push('Failed to parse XML');
				return { valid: false, errors, xsdValid: xsdValid };
			}

			if (parsed.swimsession) {
				if (!parsed.swimsession.id) {
					errors.push('swimsession missing required attribute: id');
				}
				return { valid: errors.length === 0, errors: errors, type: 'dsml', xsdValid: xsdValid };
			} else if (parsed.runsession) {
				if (!parsed.runsession.id) {
					errors.push('runsession missing required attribute: id');
				}
				return { valid: errors.length === 0, errors: errors, type: 'drml', xsdValid: xsdValid };
			} else if (parsed.bikesession) {
				if (!parsed.bikesession.id) {
					errors.push('bikesession missing required attribute: id');
				}
				return { valid: errors.length === 0, errors: errors, type: 'dcml', xsdValid: xsdValid };
			} else if (parsed.training) {
				if (!parsed.training.id) {
					errors.push('training missing required attribute: id');
				}
				if (!parsed.training.sport) {
					errors.push('training missing required element: sport');
				}
				return { valid: errors.length === 0, errors: errors, type: 'dtir', xsdValid: xsdValid };
			} else {
				errors.push('Unknown or invalid DTML document type');
			}

			return { valid: false, errors: errors, xsdValid: xsdValid };
		} catch (e: any) {
			errors.push('Validation error: ' + e.message);
			return { valid: false, errors: errors, xsdValid: xsdValid };
		}
	}

	validateXSD(filePath: string) {
		return this.xsdValidator.validateFile(filePath);
	}
}

export { XSDValidator } from './xsd';
export default DTMLValidator;

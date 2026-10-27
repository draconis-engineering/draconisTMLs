export declare class DTMLValidator {
    private parser;
    private xsdValidator;
    constructor();
    validateFile(filePath: string, options?: any): any;
    validateXSD(filePath: string): {
        valid: boolean;
        errors: string[];
        type?: string;
    };
    validateXsd(filePath: string): {
        valid: boolean;
        errors: string[];
        type?: string;
    };
}
export { XSDValidator } from './xsd';
export default DTMLValidator;

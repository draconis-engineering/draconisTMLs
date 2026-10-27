export declare class XSDValidator {
    private schemasDir;
    constructor(schemasDir?: string);
    validate(xmlContent: string, schemaType: 'dsml' | 'drml' | 'dcml' | 'dtir'): {
        valid: boolean;
        errors: string[];
    };
    validateFile(filePath: string): {
        valid: boolean;
        errors: string[];
        type?: string;
    };
}
export default XSDValidator;

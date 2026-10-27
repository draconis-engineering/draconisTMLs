"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.XSDValidator = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class XSDValidator {
    constructor(schemasDir) {
        if (schemasDir) {
            this.schemasDir = schemasDir;
            return;
        }
        // Try relative to dist/src/validators -> ../../../schemas or ../../schemas
        const tryPaths = [
            path.join(__dirname, '../../schemas'),
            path.join(__dirname, '../../../schemas'),
            path.join(process.cwd(), 'schemas'),
        ];
        for (const p of tryPaths) {
            if (fs.existsSync(p)) {
                this.schemasDir = p;
                return;
            }
        }
        this.schemasDir = path.join(__dirname, '../../schemas');
    }
    validate(xmlContent, schemaType) {
        const errors = [];
        try {
            const schemaPath = path.join(this.schemasDir, `${schemaType}.xsd`);
            if (!fs.existsSync(schemaPath)) {
                errors.push(`Schema not found: ${schemaPath}`);
                return { valid: false, errors };
            }
            // Try xmllint first (commonly available)
            try {
                const { execSync } = require('child_process');
                const tmpXml = path.join(process.env.TMPDIR || process.env.TEMP || '/tmp', `dtml_${Date.now()}_${Math.random().toString(36).slice(2)}.xml`);
                fs.writeFileSync(tmpXml, xmlContent);
                try {
                    execSync(`xmllint --noout --schema "${schemaPath}" "${tmpXml}"`, { stdio: 'pipe' });
                    try {
                        fs.unlinkSync(tmpXml);
                    }
                    catch (e3) { }
                    return { valid: true, errors: [] };
                }
                catch (err) {
                    try {
                        fs.unlinkSync(tmpXml);
                    }
                    catch (e3) { }
                    if (err.stderr) {
                        errors.push(err.stderr.toString());
                    }
                    else if (err.stdout) {
                        errors.push(err.stdout.toString());
                    }
                    else if (err.message) {
                        errors.push(err.message);
                    }
                    // Don't return false immediately? The schema might be valid - xmllint returning non-zero means invalid
                    // But let us be explicit
                    return { valid: false, errors };
                }
            }
            catch (e3) {
                // Try libxmljs2
                try {
                    const libxmljs = require('libxmljs2');
                    const xsdDoc = libxmljs.parseXml(fs.readFileSync(schemaPath, 'utf-8'));
                    const xmlDoc = libxmljs.parseXml(xmlContent);
                    const valid = xmlDoc.validate(xsdDoc);
                    if (!valid) {
                        if (xmlDoc.validationErrors) {
                            xmlDoc.validationErrors.forEach((err) => {
                                errors.push(err.message || String(err));
                            });
                        }
                    }
                    return { valid, errors };
                }
                catch (e) {
                    // Try with Python xmlschema
                    try {
                        const { execSync } = require('child_process');
                        const tmpXml = path.join(process.env.TEMP || process.cwd(), `dtml_${Date.now()}.xml`);
                        fs.writeFileSync(tmpXml, xmlContent);
                        try {
                            const cmd = `python -c "import xmlschema; schema=xmlschema.XMLSchema(r'${schemaPath.replace(/\\/g, '\\\\')}'); schema.validate(r'${tmpXml.replace(/\\/g, '\\\\')}'); print('OK')"`;
                            execSync(cmd, { stdio: 'pipe' });
                            try {
                                fs.unlinkSync(tmpXml);
                            }
                            catch (e4) { }
                            return { valid: true, errors: [] };
                        }
                        catch (err) {
                            try {
                                fs.unlinkSync(tmpXml);
                            }
                            catch (e4) { }
                            if (err.stdout)
                                errors.push(err.stdout.toString());
                            if (err.stderr)
                                errors.push(err.stderr.toString());
                            if (errors.length === 0 && err.message)
                                errors.push(err.message);
                            return { valid: false, errors };
                        }
                    }
                    catch (e2) {
                        errors.push('No XSD validator available. Install libxmljs2, xmllint, or Python xmlschema for full validation.');
                        errors.push('Basic structural validation will be used.');
                        return { valid: false, errors };
                    }
                }
            }
        }
        catch (e) {
            errors.push(`Validation error: ${e.message}`);
            return { valid: false, errors };
        }
    }
    validateFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                return { valid: false, errors: [`File not found: ${filePath}`] };
            }
            const content = fs.readFileSync(filePath, 'utf-8');
            const fileName = path.basename(filePath).toLowerCase();
            if (fileName.includes('.dsml.') || fileName.includes('dsml')) {
                return { ...this.validate(content, 'dsml'), type: 'dsml' };
            }
            else if (fileName.includes('.drml.') || fileName.includes('drml')) {
                return { ...this.validate(content, 'drml'), type: 'drml' };
            }
            else if (fileName.includes('.dcml.') || fileName.includes('dcml')) {
                return { ...this.validate(content, 'dcml'), type: 'dcml' };
            }
            else if (fileName.includes('.dtir.') || fileName.includes('dtir')) {
                return { ...this.validate(content, 'dtir'), type: 'dtir' };
            }
            else {
                // try to sniff content
                if (content.includes('<swimsession')) {
                    return { ...this.validate(content, 'dsml'), type: 'dsml' };
                }
                else if (content.includes('<runsession')) {
                    return { ...this.validate(content, 'drml'), type: 'drml' };
                }
                else if (content.includes('<bikesession')) {
                    return { ...this.validate(content, 'dcml'), type: 'dcml' };
                }
                else if (content.includes('<training')) {
                    return { ...this.validate(content, 'dtir'), type: 'dtir' };
                }
                return { valid: false, errors: ['Could not determine schema type from filename'] };
            }
        }
        catch (e) {
            return { valid: false, errors: [`Error: ${e.message}`] };
        }
    }
}
exports.XSDValidator = XSDValidator;
exports.default = XSDValidator;

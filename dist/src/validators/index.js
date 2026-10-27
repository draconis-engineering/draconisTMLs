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
exports.XSDValidator = exports.DTMLValidator = void 0;
const fs = __importStar(require("fs"));
const dtml_1 = require("../parsers/dtml");
const xsd_1 = require("./xsd");
class DTMLValidator {
    constructor() {
        this.parser = new dtml_1.DTMLParser();
        this.xsdValidator = new xsd_1.XSDValidator();
    }
    validateFile(filePath, options = {}) {
        const errors = [];
        let xsdValid;
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
            }
            else if (parsed.runsession) {
                if (!parsed.runsession.id) {
                    errors.push('runsession missing required attribute: id');
                }
                return { valid: errors.length === 0, errors: errors, type: 'drml', xsdValid: xsdValid };
            }
            else if (parsed.bikesession) {
                if (!parsed.bikesession.id) {
                    errors.push('bikesession missing required attribute: id');
                }
                return { valid: errors.length === 0, errors: errors, type: 'dcml', xsdValid: xsdValid };
            }
            else if (parsed.training) {
                if (!parsed.training.id) {
                    errors.push('training missing required attribute: id');
                }
                if (!parsed.training.sport) {
                    errors.push('training missing required element: sport');
                }
                return { valid: errors.length === 0, errors: errors, type: 'dtir', xsdValid: xsdValid };
            }
            else {
                errors.push('Unknown or invalid DTML document type');
            }
            return { valid: false, errors: errors, xsdValid: xsdValid };
        }
        catch (e) {
            errors.push('Validation error: ' + e.message);
            return { valid: false, errors: errors, xsdValid: xsdValid };
        }
    }
    validateXSD(filePath) {
        return this.xsdValidator.validateFile(filePath);
    }
    validateXsd(filePath) {
        return this.xsdValidator.validateFile(filePath);
    }
}
exports.DTMLValidator = DTMLValidator;
var xsd_2 = require("./xsd");
Object.defineProperty(exports, "XSDValidator", { enumerable: true, get: function () { return xsd_2.XSDValidator; } });
exports.default = DTMLValidator;

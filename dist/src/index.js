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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XSDValidator = void 0;
const xsd_1 = require("./validators/xsd");
Object.defineProperty(exports, "XSDValidator", { enumerable: true, get: function () { return xsd_1.XSDValidator; } });
__exportStar(require("./parsers"), exports);
__exportStar(require("./validators"), exports);
__exportStar(require("./transformers/dtir"), exports);
__exportStar(require("./writers"), exports);
__exportStar(require("./types"), exports);

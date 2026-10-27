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
exports.DRMLParser = void 0;
const fast_xml_parser_1 = require("fast-xml-parser");
const fs = __importStar(require("fs"));
class DRMLParser {
    constructor() {
        this.parser = new fast_xml_parser_1.XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
            textNodeName: '#text',
            parseAttributeValue: true,
            trimValues: true,
        });
    }
    parseFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return this.parse(content);
    }
    parse(xml) {
        const raw = this.parser.parse(xml);
        if (raw && raw.runsession) {
            return this.toRunSession(raw.runsession);
        }
        return raw;
    }
    toDuration(attrs) {
        const duration = {};
        if (attrs.durationSeconds !== undefined && attrs.durationSeconds !== null)
            duration.seconds = Number(attrs.durationSeconds);
        if (attrs.durationMinutes !== undefined && attrs.durationMinutes !== null)
            duration.minutes = Number(attrs.durationMinutes);
        if (attrs.durationHours !== undefined && attrs.durationHours !== null)
            duration.hours = Number(attrs.durationHours);
        return duration;
    }
    toDistance(attrs) {
        const distance = {};
        if (attrs.distanceKm !== undefined && attrs.distanceKm !== null)
            distance.kilometers = Number(attrs.distanceKm);
        if (attrs.distanceMiles !== undefined && attrs.distanceMiles !== null)
            distance.miles = Number(attrs.distanceMiles);
        if (attrs.distanceMeters !== undefined && attrs.distanceMeters !== null)
            distance.meters = Number(attrs.distanceMeters);
        return Object.keys(distance).length > 0 ? distance : undefined;
    }
    toIntensity(attrs) {
        const intensity = {};
        if (attrs.RPE !== undefined && attrs.RPE !== null)
            intensity.rpe = Number(attrs.RPE);
        if (attrs.HR !== undefined && attrs.HR !== null)
            intensity.hr = Number(attrs.HR);
        if (attrs.pace !== undefined && attrs.pace !== null)
            intensity.pace = String(attrs.pace);
        return Object.keys(intensity).length > 0 ? intensity : undefined;
    }
    parseActivity(node, key) {
        if (!node)
            return null;
        const k = key || Object.keys(node)[0];
        const attrs = typeof node === 'object' && !Array.isArray(node) && node[k] && typeof node[k] === 'object' && !(node[k] instanceof Array) && Object.keys(node).length === 1 ? node[k] : (node[k] !== undefined ? node[k] : node);
        if (k === 'rest') {
            const duration = this.toDuration(attrs);
            return { type: 'rest', duration, restType: attrs.type || 'static' };
        }
        if (k === 'walk') {
            return { type: 'walk', distance: this.toDistance(attrs), duration: this.toDuration(attrs) };
        }
        if (k === 'strides') {
            return { type: 'strides', count: attrs.count !== undefined ? Number(attrs.count) : undefined, distanceMeters: attrs.distanceMeters !== undefined ? Number(attrs.distanceMeters) : undefined, intensity: this.toIntensity(attrs) };
        }
        if (k === 'drills') {
            return { type: 'drills', name: attrs.name, duration: this.toDuration(attrs), notes: attrs.notes };
        }
        if (k === 'run' || k === 'easy' || k === 'tempo' || k === 'threshold') {
            return { type: 'run', subtype: k === 'run' ? undefined : k, distance: this.toDistance(attrs), duration: this.toDuration(attrs), intensity: this.toIntensity(attrs), notes: attrs.notes };
        }
        return null;
    }
    parsePhase(phaseNode) {
        if (!phaseNode)
            return [];
        const activities = [];
        for (const key of Object.keys(phaseNode)) {
            if (key === '#text' || key === 'xmlns')
                continue;
            const value = phaseNode[key];
            if (Array.isArray(value)) {
                for (const item of value) {
                    if (key === 'repeats') {
                        const rep = this.parseRepeats(item);
                        if (rep)
                            activities.push(rep);
                    }
                    else if (key === 'intervals') {
                        const iv = this.parseIntervals(item);
                        if (iv)
                            activities.push(iv);
                    }
                    else {
                        const act = this.parseActivity(item, key);
                        if (act)
                            activities.push(act);
                    }
                }
            }
            else if (typeof value === 'object') {
                if (key === 'repeats') {
                    const rep = this.parseRepeats(value);
                    if (rep)
                        activities.push(rep);
                }
                else if (key === 'intervals') {
                    const iv = this.parseIntervals(value);
                    if (iv)
                        activities.push(iv);
                }
                else {
                    const act = this.parseActivity(value, key);
                    if (act)
                        activities.push(act);
                }
            }
        }
        return activities;
    }
    parseRepeats(node) {
        if (!node)
            return null;
        const count = node.count !== undefined ? Number(node.count) : 1;
        const items = [];
        for (const key of Object.keys(node)) {
            if (key === 'count' || key === '#text')
                continue;
            const value = node[key];
            if (Array.isArray(value)) {
                for (const item of value) {
                    if (key === 'intervals') {
                        const iv = this.parseIntervals(item);
                        if (iv)
                            items.push(iv);
                    }
                    else if (key === 'rest') {
                        const act = this.parseActivity(item, key);
                        if (act)
                            items.push(act);
                    }
                    else {
                        const act = this.parseActivity(item, key);
                        if (act)
                            items.push(act);
                    }
                }
            }
            else if (typeof value === 'object') {
                if (key === 'intervals') {
                    const iv = this.parseIntervals(value);
                    if (iv)
                        items.push(iv);
                }
                else {
                    const act = this.parseActivity(value, key);
                    if (act)
                        items.push(act);
                }
            }
        }
        return { type: 'repeats', count, items };
    }
    parseIntervals(node) {
        if (!node)
            return null;
        const repeats = node.repeats !== undefined ? Number(node.repeats) : 1;
        let work = null;
        let rest = null;
        if (node.work) {
            const w = Array.isArray(node.work) ? node.work[0] : node.work;
            work = { type: 'run', distance: this.toDistance(w), duration: this.toDuration(w), intensity: this.toIntensity(w) };
        }
        if (node.rest) {
            const r = Array.isArray(node.rest) ? node.rest[0] : node.rest;
            rest = { type: 'rest', duration: this.toDuration(r), restType: r.type || 'static' };
        }
        if (!work || !rest)
            return null;
        return { type: 'intervals', repeats, work, rest };
    }
    toRunSession(run) {
        const metadata = {
            id: run.id,
            name: run.name,
            date: run.date,
            version: run.version,
        };
        if (run.metadata) {
            if (run.metadata.description)
                metadata.description = run.metadata.description;
            if (run.metadata.athlete)
                metadata.athlete = run.metadata.athlete;
            if (run.metadata.coach)
                metadata.coach = run.metadata.coach;
            if (run.metadata.notes)
                metadata.notes = run.metadata.notes;
        }
        const config = {};
        if (run.config) {
            if (run.config.location) {
                config.location = {
                    type: run.config.location.type,
                    surface: run.config.location.surface,
                    elevation: run.config.location.elevation !== undefined ? Number(run.config.location.elevation) : undefined,
                };
            }
            if (run.config.gear) {
                config.gear = { shoes: run.config.gear.shoes, watch: run.config.gear.watch === true || run.config.gear.watch === 'true' };
            }
        }
        metadata.config = config;
        const phases = [];
        const phaseNames = ['presession', 'warmup', 'main', 'cooldown', 'postsession'];
        for (const name of phaseNames) {
            if (run[name]) {
                const activities = this.parsePhase(run[name]);
                phases.push({ name: name, activities });
            }
        }
        return {
            type: 'runsession',
            metadata,
            config,
            phases,
        };
    }
}
exports.DRMLParser = DRMLParser;
exports.default = DRMLParser;

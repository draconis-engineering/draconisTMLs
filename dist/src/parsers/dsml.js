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
exports.DSMLParser = void 0;
const fast_xml_parser_1 = require("fast-xml-parser");
const fs = __importStar(require("fs"));
class DSMLParser {
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
        if (raw && raw.swimsession) {
            return this.toSwimSession(raw.swimsession);
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
        if (attrs.lengthSeconds !== undefined && attrs.lengthSeconds !== null)
            duration.seconds = Number(attrs.lengthSeconds);
        if (attrs.lengthMinutes !== undefined && attrs.lengthMinutes !== null)
            duration.minutes = Number(attrs.lengthMinutes);
        if (attrs.lengthHours !== undefined && attrs.lengthHours !== null)
            duration.hours = Number(attrs.lengthHours);
        return duration;
    }
    toDistance(attrs) {
        const distance = {};
        if (attrs.lengthMeters !== undefined && attrs.lengthMeters !== null)
            distance.meters = Number(attrs.lengthMeters);
        if (attrs.lengthYards !== undefined && attrs.lengthYards !== null)
            distance.yards = Number(attrs.lengthYards);
        if (attrs.distanceMeters !== undefined && attrs.distanceMeters !== null)
            distance.meters = Number(attrs.distanceMeters);
        if (attrs.distanceYards !== undefined && attrs.distanceYards !== null)
            distance.yards = Number(attrs.distanceYards);
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
    toEquipment(attrs) {
        const eq = {};
        if (attrs.paddles !== undefined)
            eq.paddles = attrs.paddles === true || attrs.paddles === 'true';
        if (attrs.fins !== undefined)
            eq.fins = attrs.fins === true || attrs.fins === 'true';
        if (attrs.snorkel !== undefined)
            eq.snorkel = attrs.snorkel === true || attrs.snorkel === 'true';
        if (attrs.pullbuoy !== undefined)
            eq.pullbuoy = attrs.pullbuoy === true || attrs.pullbuoy === 'true';
        if (attrs.kickboard !== undefined)
            eq.kickboard = attrs.kickboard === true || attrs.kickboard === 'true';
        if (attrs.bands !== undefined)
            eq.bands = attrs.bands === true || attrs.bands === 'true';
        return Object.keys(eq).length > 0 ? eq : undefined;
    }
    parseActivity(node, name) {
        if (!node)
            return null;
        // node might be array? but we pass individual items
        const key = name || Object.keys(node)[0];
        const attrs = node[key] !== undefined && typeof node[key] === 'object' && !Array.isArray(node[key]) ? node[key] : node;
        // If attrs has multiple children as direct properties (when parsed differently), handle
        if (key === 'rest' || (attrs && attrs.lengthSeconds !== undefined && Object.keys(attrs).some(k => ['lengthMinutes', 'durationMinutes', 'notes'].includes(k)) && key === 'rest')) {
            // but in our structure above, rest is element
        }
        if (key === 'rest') {
            const duration = this.toDuration(attrs);
            if (Object.keys(duration).length === 0)
                return null;
            return { type: 'rest', duration };
        }
        if (key === 'bandWork' || key === 'bandwork') {
            const duration = this.toDuration(attrs);
            return { type: 'bandwork', duration };
        }
        if (key === 'sauna') {
            const duration = this.toDuration(attrs);
            return { type: 'sauna', duration, temperatureCelsius: attrs.temperatureCelsius !== undefined ? Number(attrs.temperatureCelsius) : undefined };
        }
        if (key === 'drill') {
            return {
                type: 'drill',
                name: attrs.name,
                distance: this.toDistance(attrs),
                duration: this.toDuration(attrs),
                intensity: this.toIntensity(attrs),
                notes: attrs.notes,
            };
        }
        if (key === 'superman') {
            return {
                type: 'drill',
                name: 'superman',
                distance: this.toDistance(attrs),
                duration: this.toDuration(attrs),
                intensity: this.toIntensity(attrs),
                notes: attrs.notes,
            };
        }
        if (key === 'freestyle' || key === 'backstroke' || key === 'breaststroke' || key === 'butterfly' || key === 'medley' || key === 'swim') {
            return {
                type: 'stroke',
                stroke: key === 'medley' ? 'medley' : (key === 'swim' ? 'freestyle' : key),
                distance: this.toDistance(attrs),
                duration: this.toDuration(attrs),
                intensity: this.toIntensity(attrs),
                equipment: this.toEquipment(attrs),
                notes: attrs.notes,
            };
        }
        // Fallback
        return null;
    }
    parsePhase(phaseNode) {
        if (!phaseNode)
            return [];
        const activities = [];
        // Iterate over all properties
        for (const key of Object.keys(phaseNode)) {
            if (key === '#text' || key === 'xmlns')
                continue;
            const value = phaseNode[key];
            if (Array.isArray(value)) {
                for (const item of value) {
                    if (key === 'repeat') {
                        const repeat = this.parseRepeat(item);
                        if (repeat)
                            activities.push(repeat);
                    }
                    else if (key === 'drillset') {
                        const drillset = this.parseDrillSet(item);
                        if (drillset)
                            activities.push(drillset);
                    }
                    else {
                        const act = this.parseActivity(item, key);
                        if (act)
                            activities.push(act);
                    }
                }
            }
            else if (typeof value === 'object') {
                if (key === 'repeat') {
                    const repeat = this.parseRepeat(value);
                    if (repeat)
                        activities.push(repeat);
                }
                else if (key === 'drillset') {
                    const drillset = this.parseDrillSet(value);
                    if (drillset)
                        activities.push(drillset);
                }
                else {
                    const act = this.parseActivity(value, key);
                    if (act)
                        activities.push(act);
                }
            }
            else {
                // scalar?
            }
        }
        return activities;
    }
    parseRepeat(node) {
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
                    if (key === 'drillset') {
                        const ds = this.parseDrillSet(item);
                        if (ds)
                            items.push(ds);
                    }
                    else {
                        const act = this.parseActivity(item, key);
                        if (act)
                            items.push(act);
                    }
                }
            }
            else if (typeof value === 'object') {
                if (key === 'drillset') {
                    const ds = this.parseDrillSet(value);
                    if (ds)
                        items.push(ds);
                }
                else {
                    const act = this.parseActivity(value, key);
                    if (act)
                        items.push(act);
                }
            }
        }
        return { type: 'repeat', count, items };
    }
    parseDrillSet(node) {
        if (!node)
            return null;
        const items = [];
        for (const key of Object.keys(node)) {
            if (key === '#text')
                continue;
            const value = node[key];
            if (Array.isArray(value)) {
                for (const item of value) {
                    const act = this.parseActivity(item, key);
                    if (act)
                        items.push(act);
                }
            }
            else if (typeof value === 'object') {
                const act = this.parseActivity(value, key);
                if (act)
                    items.push(act);
            }
        }
        return { type: 'drillset', items };
    }
    toSwimSession(swim) {
        const metadata = {
            id: swim.id,
            name: swim.name,
            date: swim.date,
            version: swim.version,
        };
        if (swim.metadata) {
            if (swim.metadata.description)
                metadata.description = swim.metadata.description;
            if (swim.metadata.athlete)
                metadata.athlete = swim.metadata.athlete;
            if (swim.metadata.coach)
                metadata.coach = swim.metadata.coach;
            if (swim.metadata.notes)
                metadata.notes = swim.metadata.notes;
        }
        const config = {};
        if (swim.config) {
            if (swim.config.pool) {
                config.pool = {
                    lengthMeters: swim.config.pool.lengthMeters !== undefined ? Number(swim.config.pool.lengthMeters) : undefined,
                    lengthYards: swim.config.pool.lengthYards !== undefined ? Number(swim.config.pool.lengthYards) : undefined,
                    laneWidthMeters: swim.config.pool.laneWidthMeters !== undefined ? Number(swim.config.pool.laneWidthMeters) : undefined,
                    depthMeters: swim.config.pool.depthMeters !== undefined ? Number(swim.config.pool.depthMeters) : undefined,
                    indoor: swim.config.pool.indoor !== undefined ? (swim.config.pool.indoor === true || swim.config.pool.indoor === 'true') : undefined,
                };
            }
            if (swim.config.gear) {
                config.gear = this.toEquipment(swim.config.gear) || {};
            }
        }
        metadata.config = config;
        const phases = [];
        const phaseNames = ['presession', 'warmup', 'main', 'cooldown', 'postsession'];
        for (const name of phaseNames) {
            if (swim[name]) {
                const activities = this.parsePhase(swim[name]);
                if (activities.length > 0 || true) { // include phase even if empty? schema allows structure
                    phases.push({ name: name, activities });
                }
            }
        }
        return {
            type: 'swimsession',
            metadata,
            config,
            phases,
        };
    }
}
exports.DSMLParser = DSMLParser;
exports.default = DSMLParser;

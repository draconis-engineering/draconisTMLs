import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';
import {
	SwimSession,
	SwimActivity,
	SwimPhase,
	SwimStroke,
	Drill,
	SwimRest,
	Repeat,
	DrillSet,
	BandWork,
	Sauna,
	SwimConfig,
} from '../types/dsml';
import { Duration } from '../types/common';

export class DSMLParser {
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
		const raw = this.parser.parse(xml);
		if (raw && raw.swimsession) {
			return this.toSwimSession(raw.swimsession);
		}
		return raw;
	}

	private toDuration(attrs: any): Duration {
		const duration: Duration = {};
		if (attrs.durationSeconds !== undefined && attrs.durationSeconds !== null) duration.seconds = Number(attrs.durationSeconds);
		if (attrs.durationMinutes !== undefined && attrs.durationMinutes !== null) duration.minutes = Number(attrs.durationMinutes);
		if (attrs.durationHours !== undefined && attrs.durationHours !== null) duration.hours = Number(attrs.durationHours);
		if (attrs.lengthSeconds !== undefined && attrs.lengthSeconds !== null) duration.seconds = Number(attrs.lengthSeconds);
		if (attrs.lengthMinutes !== undefined && attrs.lengthMinutes !== null) duration.minutes = Number(attrs.lengthMinutes);
		if (attrs.lengthHours !== undefined && attrs.lengthHours !== null) duration.hours = Number(attrs.lengthHours);
		return duration;
	}

	private toDistance(attrs: any) {
		const distance: any = {};
		if (attrs.lengthMeters !== undefined && attrs.lengthMeters !== null) distance.meters = Number(attrs.lengthMeters);
		if (attrs.lengthYards !== undefined && attrs.lengthYards !== null) distance.yards = Number(attrs.lengthYards);
		if (attrs.distanceMeters !== undefined && attrs.distanceMeters !== null) distance.meters = Number(attrs.distanceMeters);
		if (attrs.distanceYards !== undefined && attrs.distanceYards !== null) distance.yards = Number(attrs.distanceYards);
		return Object.keys(distance).length > 0 ? distance : undefined;
	}

	private toIntensity(attrs: any) {
		const intensity: any = {};
		if (attrs.RPE !== undefined && attrs.RPE !== null) intensity.rpe = Number(attrs.RPE);
		if (attrs.HR !== undefined && attrs.HR !== null) intensity.hr = Number(attrs.HR);
		if (attrs.pace !== undefined && attrs.pace !== null) intensity.pace = String(attrs.pace);
		return Object.keys(intensity).length > 0 ? intensity : undefined;
	}

	private toEquipment(attrs: any) {
		const eq: any = {};
		if (attrs.paddles !== undefined) eq.paddles = attrs.paddles === true || attrs.paddles === 'true';
		if (attrs.fins !== undefined) eq.fins = attrs.fins === true || attrs.fins === 'true';
		if (attrs.snorkel !== undefined) eq.snorkel = attrs.snorkel === true || attrs.snorkel === 'true';
		if (attrs.pullbuoy !== undefined) eq.pullbuoy = attrs.pullbuoy === true || attrs.pullbuoy === 'true';
		if (attrs.kickboard !== undefined) eq.kickboard = attrs.kickboard === true || attrs.kickboard === 'true';
		if (attrs.bands !== undefined) eq.bands = attrs.bands === true || attrs.bands === 'true';
		return Object.keys(eq).length > 0 ? eq : undefined;
	}

	private parseActivity(node: any, name?: string): SwimActivity | null {
		if (!node) return null;
		// node might be array? but we pass individual items
		const key = name || Object.keys(node)[0];
		const attrs = node[key] !== undefined && typeof node[key] === 'object' && !Array.isArray(node[key]) ? node[key] : node;

		// If attrs has multiple children as direct properties (when parsed differently), handle
		if (key === 'rest' || (attrs && attrs.lengthSeconds !== undefined && Object.keys(attrs).some(k => ['lengthMinutes', 'durationMinutes', 'notes'].includes(k)) && key === 'rest')) {
			// but in our structure above, rest is element
		}

		if (key === 'rest') {
			const duration = this.toDuration(attrs);
			if (Object.keys(duration).length === 0) return null;
			return { type: 'rest', duration } as SwimRest;
		}
		if (key === 'bandWork' || key === 'bandwork') {
			const duration = this.toDuration(attrs);
			return { type: 'bandwork', duration } as BandWork;
		}
		if (key === 'sauna') {
			const duration = this.toDuration(attrs);
			return { type: 'sauna', duration, temperatureCelsius: attrs.temperatureCelsius !== undefined ? Number(attrs.temperatureCelsius) : undefined } as Sauna;
		}
		if (key === 'drill') {
			return {
				type: 'drill',
				name: attrs.name,
				distance: this.toDistance(attrs),
				duration: this.toDuration(attrs),
				intensity: this.toIntensity(attrs),
				notes: attrs.notes,
			} as Drill;
		}
		if (key === 'superman') {
			return {
				type: 'drill',
				name: 'superman',
				distance: this.toDistance(attrs),
				duration: this.toDuration(attrs),
				intensity: this.toIntensity(attrs),
				notes: attrs.notes,
			} as Drill;
		}
		if (key === 'freestyle' || key === 'backstroke' || key === 'breaststroke' || key === 'butterfly' || key === 'medley' || key === 'swim') {
			return {
				type: 'stroke',
				stroke: key === 'medley' ? 'medley' : (key === 'swim' ? 'freestyle' : key) as any,
				distance: this.toDistance(attrs),
				duration: this.toDuration(attrs),
				intensity: this.toIntensity(attrs),
				equipment: this.toEquipment(attrs),
				notes: attrs.notes,
			} as SwimStroke;
		}
		// Fallback
		return null;
	}

	private parsePhase(phaseNode: any): SwimActivity[] {
		if (!phaseNode) return [];
		const activities: SwimActivity[] = [];

		// Iterate over all properties
		for (const key of Object.keys(phaseNode)) {
			if (key === '#text' || key === 'xmlns') continue;
			const value = phaseNode[key];
			if (Array.isArray(value)) {
				for (const item of value) {
					if (key === 'repeat') {
						const repeat = this.parseRepeat(item);
						if (repeat) activities.push(repeat);
					} else if (key === 'drillset') {
						const drillset = this.parseDrillSet(item);
						if (drillset) activities.push(drillset);
					} else {
						const act = this.parseActivity(item, key);
						if (act) activities.push(act);
					}
				}
			} else if (typeof value === 'object') {
				if (key === 'repeat') {
					const repeat = this.parseRepeat(value);
					if (repeat) activities.push(repeat);
				} else if (key === 'drillset') {
					const drillset = this.parseDrillSet(value);
					if (drillset) activities.push(drillset);
				} else {
					const act = this.parseActivity(value, key);
					if (act) activities.push(act);
				}
			} else {
				// scalar?
			}
		}
		return activities;
	}

	private parseRepeat(node: any): Repeat | null {
		if (!node) return null;
		const count = node.count !== undefined ? Number(node.count) : 1;
		const items: any[] = [];
		for (const key of Object.keys(node)) {
			if (key === 'count' || key === '#text') continue;
			const value = node[key];
			if (Array.isArray(value)) {
				for (const item of value) {
					if (key === 'drillset') {
						const ds = this.parseDrillSet(item);
						if (ds) items.push(ds);
					} else {
						const act = this.parseActivity(item, key);
						if (act) items.push(act);
					}
				}
			} else if (typeof value === 'object') {
				if (key === 'drillset') {
					const ds = this.parseDrillSet(value);
					if (ds) items.push(ds);
				} else {
					const act = this.parseActivity(value, key);
					if (act) items.push(act);
				}
			}
		}
		return { type: 'repeat', count, items };
	}

	private parseDrillSet(node: any): DrillSet | null {
		if (!node) return null;
		const items: any[] = [];
		for (const key of Object.keys(node)) {
			if (key === '#text') continue;
			const value = node[key];
			if (Array.isArray(value)) {
				for (const item of value) {
					const act = this.parseActivity(item, key);
					if (act) items.push(act);
				}
			} else if (typeof value === 'object') {
				const act = this.parseActivity(value, key);
				if (act) items.push(act);
			}
		}
		return { type: 'drillset', items };
	}

	private toSwimSession(swim: any): SwimSession {
		const metadata: any = {
			id: swim.id,
			name: swim.name,
			date: swim.date,
			version: swim.version,
		};
		if (swim.metadata) {
			if (swim.metadata.description) metadata.description = swim.metadata.description;
			if (swim.metadata.athlete) metadata.athlete = swim.metadata.athlete;
			if (swim.metadata.coach) metadata.coach = swim.metadata.coach;
			if (swim.metadata.notes) metadata.notes = swim.metadata.notes;
		}
		const config: SwimConfig = {};
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

		const phases: SwimPhase[] = [];
		const phaseNames = ['presession', 'warmup', 'main', 'cooldown', 'postsession'] as const;
		for (const name of phaseNames) {
			if (swim[name]) {
				const activities = this.parsePhase(swim[name]);
				if (activities.length > 0 || true) { // include phase even if empty? schema allows structure
					phases.push({ name: name as any, activities });
				}
			}
		}

		return {
			type: 'swimsession',
			metadata,
			config,
			phases,
		} as SwimSession;
	}
}

export default DSMLParser;

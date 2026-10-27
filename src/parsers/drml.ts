import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import { RunSession, RunActivity, RunPhase, Run, Walk, Strides, Drills, RunIntervals, Repeats, RunRest } from '../types/drml';

export class DRMLParser {
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
		if (raw && raw.runsession) {
			return this.toRunSession(raw.runsession);
		}
		return raw;
	}

	private toDuration(attrs: any) {
		const duration: any = {};
		if (attrs.durationSeconds !== undefined && attrs.durationSeconds !== null) duration.seconds = Number(attrs.durationSeconds);
		if (attrs.durationMinutes !== undefined && attrs.durationMinutes !== null) duration.minutes = Number(attrs.durationMinutes);
		if (attrs.durationHours !== undefined && attrs.durationHours !== null) duration.hours = Number(attrs.durationHours);
		return duration;
	}

	private toDistance(attrs: any) {
		const distance: any = {};
		if (attrs.distanceKm !== undefined && attrs.distanceKm !== null) distance.kilometers = Number(attrs.distanceKm);
		if (attrs.distanceMiles !== undefined && attrs.distanceMiles !== null) distance.miles = Number(attrs.distanceMiles);
		if (attrs.distanceMeters !== undefined && attrs.distanceMeters !== null) distance.meters = Number(attrs.distanceMeters);
		return Object.keys(distance).length > 0 ? distance : undefined;
	}

	private toIntensity(attrs: any) {
		const intensity: any = {};
		if (attrs.RPE !== undefined && attrs.RPE !== null) intensity.rpe = Number(attrs.RPE);
		if (attrs.HR !== undefined && attrs.HR !== null) intensity.hr = Number(attrs.HR);
		if (attrs.pace !== undefined && attrs.pace !== null) intensity.pace = String(attrs.pace);
		return Object.keys(intensity).length > 0 ? intensity : undefined;
	}

	private parseActivity(node: any, key?: string): RunActivity | null {
		if (!node) return null;
		const k = key || Object.keys(node)[0];
		const attrs = typeof node === 'object' && !Array.isArray(node) && node[k] && typeof node[k] === 'object' && !(node[k] instanceof Array) && Object.keys(node).length === 1 ? node[k] : (node[k] !== undefined ? node[k] : node);

		if (k === 'rest') {
			const duration = this.toDuration(attrs);
			return { type: 'rest', duration, restType: attrs.type || 'static' } as RunRest;
		}
		if (k === 'walk') {
			return { type: 'walk', distance: this.toDistance(attrs), duration: this.toDuration(attrs) } as Walk;
		}
		if (k === 'strides') {
			return { type: 'strides', count: attrs.count !== undefined ? Number(attrs.count) : undefined, distanceMeters: attrs.distanceMeters !== undefined ? Number(attrs.distanceMeters) : undefined, intensity: this.toIntensity(attrs) } as Strides;
		}
		if (k === 'drills') {
			return { type: 'drills', name: attrs.name, duration: this.toDuration(attrs), notes: attrs.notes } as Drills;
		}
		if (k === 'run' || k === 'easy' || k === 'tempo' || k === 'threshold') {
			return { type: 'run', subtype: k === 'run' ? undefined : k, distance: this.toDistance(attrs), duration: this.toDuration(attrs), intensity: this.toIntensity(attrs), notes: attrs.notes } as Run;
		}
		return null;
	}

	private parsePhase(phaseNode: any): RunActivity[] {
		if (!phaseNode) return [];
		const activities: RunActivity[] = [];
		for (const key of Object.keys(phaseNode)) {
			if (key === '#text' || key === 'xmlns') continue;
			const value = phaseNode[key];
			if (Array.isArray(value)) {
				for (const item of value) {
					if (key === 'repeats') {
						const rep = this.parseRepeats(item);
						if (rep) activities.push(rep);
					} else if (key === 'intervals') {
						const iv = this.parseIntervals(item);
						if (iv) activities.push(iv);
					} else {
						const act = this.parseActivity(item, key);
						if (act) activities.push(act);
					}
				}
			} else if (typeof value === 'object') {
				if (key === 'repeats') {
					const rep = this.parseRepeats(value);
					if (rep) activities.push(rep);
				} else if (key === 'intervals') {
					const iv = this.parseIntervals(value);
					if (iv) activities.push(iv);
				} else {
					const act = this.parseActivity(value, key);
					if (act) activities.push(act);
				}
			}
		}
		return activities;
	}

	private parseRepeats(node: any): Repeats | null {
		if (!node) return null;
		const count = node.count !== undefined ? Number(node.count) : 1;
		const items: any[] = [];
		for (const key of Object.keys(node)) {
			if (key === 'count' || key === '#text') continue;
			const value = node[key];
			if (Array.isArray(value)) {
				for (const item of value) {
					if (key === 'intervals') {
						const iv = this.parseIntervals(item);
						if (iv) items.push(iv);
					} else if (key === 'rest') {
						const act = this.parseActivity(item, key);
						if (act) items.push(act);
					} else {
						const act = this.parseActivity(item, key);
						if (act) items.push(act);
					}
				}
			} else if (typeof value === 'object') {
				if (key === 'intervals') {
					const iv = this.parseIntervals(value);
					if (iv) items.push(iv);
				} else {
					const act = this.parseActivity(value, key);
					if (act) items.push(act);
				}
			}
		}
		return { type: 'repeats', count, items };
	}

	private parseIntervals(node: any): RunIntervals | null {
		if (!node) return null;
		const repeats = node.repeats !== undefined ? Number(node.repeats) : 1;
		let work: any = null;
		let rest: any = null;
		if (node.work) {
			const w = Array.isArray(node.work) ? node.work[0] : node.work;
			work = { type: 'run', distance: this.toDistance(w), duration: this.toDuration(w), intensity: this.toIntensity(w) };
		}
		if (node.rest) {
			const r = Array.isArray(node.rest) ? node.rest[0] : node.rest;
			rest = { type: 'rest', duration: this.toDuration(r), restType: r.type || 'static' };
		}
		if (!work || !rest) return null;
		return { type: 'intervals', repeats, work, rest };
	}

	private toRunSession(run: any): RunSession {
		const metadata: any = {
			id: run.id,
			name: run.name,
			date: run.date,
			version: run.version,
		};
		if (run.metadata) {
			if (run.metadata.description) metadata.description = run.metadata.description;
			if (run.metadata.athlete) metadata.athlete = run.metadata.athlete;
			if (run.metadata.coach) metadata.coach = run.metadata.coach;
			if (run.metadata.notes) metadata.notes = run.metadata.notes;
		}
		const config: any = {};
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

		const phases: RunPhase[] = [];
		const phaseNames = ['presession', 'warmup', 'main', 'cooldown', 'postsession'] as const;
		for (const name of phaseNames) {
			if (run[name]) {
				const activities = this.parsePhase(run[name]);
				phases.push({ name: name as any, activities });
			}
		}

		return {
			type: 'runsession',
			metadata,
			config,
			phases,
		} as RunSession;
	}
}

export default DRMLParser;


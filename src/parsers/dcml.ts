import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import { BikeSession, BikeActivity, BikePhase, Ride, CycleRest, CycleIntervals, Blocks } from '../types/dcml';

export class DCMLParser {
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
		if (raw && raw.bikesession) {
			return this.toBikeSession(raw.bikesession);
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

	private parseActivity(node: any, key?: string): BikeActivity | null {
		if (!node) return null;
		const k = key || Object.keys(node)[0];
		const attrs = typeof node === 'object' && !Array.isArray(node) && node[k] && typeof node[k] === 'object' && !(node[k] instanceof Array) && Object.keys(node).length === 1 ? node[k] : (node[k] !== undefined ? node[k] : node);

		if (k === 'rest') {
			const duration = this.toDuration(attrs);
			return { type: 'rest', duration, power: attrs.power !== undefined ? Number(attrs.power) : undefined, ftpPct: attrs.FTPpct !== undefined ? Number(attrs.FTPpct) : (attrs.ftpPct !== undefined ? Number(attrs.ftpPct) : undefined) } as CycleRest;
		}
		if (k === 'ride' || k === 'warm' || k === 'easy' || k === 'steady' || k === 'threshold' || k === 'sweetspot' || k === 'vo2') {
			return {
				type: 'ride',
				subtype: k === 'ride' ? undefined : k,
				distance: this.toDistance(attrs),
				duration: this.toDuration(attrs),
				power: attrs.power !== undefined ? Number(attrs.power) : undefined,
				cadence: attrs.cadence !== undefined ? Number(attrs.cadence) : undefined,
				ftpPct: attrs.FTPpct !== undefined ? Number(attrs.FTPpct) : (attrs.ftpPct !== undefined ? Number(attrs.ftpPct) : undefined),
				intensity: this.toIntensity(attrs),
				notes: attrs.notes,
			} as Ride;
		}
		return null;
	}

	private parsePhase(phaseNode: any): BikeActivity[] {
		if (!phaseNode) return [];
		const activities: BikeActivity[] = [];
		for (const key of Object.keys(phaseNode)) {
			if (key === '#text' || key === 'xmlns') continue;
			const value = phaseNode[key];
			if (Array.isArray(value)) {
				for (const item of value) {
					if (key === 'blocks') {
						const b = this.parseBlocks(item);
						if (b) activities.push(b);
					} else if (key === 'intervals') {
						const iv = this.parseIntervals(item);
						if (iv) activities.push(iv);
					} else {
						const act = this.parseActivity(item, key);
						if (act) activities.push(act);
					}
				}
			} else if (typeof value === 'object') {
				if (key === 'blocks') {
					const b = this.parseBlocks(value);
					if (b) activities.push(b);
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

	private parseBlocks(node: any): Blocks | null {
		if (!node) return null;
		const repeats = node.repeats !== undefined ? Number(node.repeats) : 1;
		const items: any[] = [];
		for (const key of Object.keys(node)) {
			if (key === 'repeats' || key === '#text') continue;
			const value = node[key];
			if (Array.isArray(value)) {
				for (const item of value) {
					if (key === 'intervals') {
						const iv = this.parseIntervals(item);
						if (iv) items.push(iv);
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
		return { type: 'blocks', repeats, items };
	}

	private parseIntervals(node: any): CycleIntervals | null {
		if (!node) return null;
		const repeats = node.repeats !== undefined ? Number(node.repeats) : 1;
		let work: any = null;
		let rest: any = null;
		if (node.work) {
			const w = Array.isArray(node.work) ? node.work[0] : node.work;
			work = { type: 'ride', duration: this.toDuration(w), power: w.power !== undefined ? Number(w.power) : undefined, cadence: w.cadence !== undefined ? Number(w.cadence) : undefined, ftpPct: w.FTPpct !== undefined ? Number(w.FTPpct) : undefined, intensity: this.toIntensity(w) };
		}
		if (node.rest) {
			const r = Array.isArray(node.rest) ? node.rest[0] : node.rest;
			rest = { type: 'rest', duration: this.toDuration(r), power: r.power !== undefined ? Number(r.power) : undefined, ftpPct: r.FTPpct !== undefined ? Number(r.FTPpct) : undefined };
		}
		if (!work || !rest) return null;
		return { type: 'intervals', repeats, work, rest };
	}

	private toBikeSession(bike: any): BikeSession {
		const metadata: any = {
			id: bike.id,
			name: bike.name,
			date: bike.date,
			version: bike.version,
		};
		if (bike.metadata) {
			if (bike.metadata.description) metadata.description = bike.metadata.description;
			if (bike.metadata.athlete) metadata.athlete = bike.metadata.athlete;
			if (bike.metadata.coach) metadata.coach = bike.metadata.coach;
			if (bike.metadata.notes) metadata.notes = bike.metadata.notes;
		}
		const config: any = {};
		if (bike.config) {
			if (bike.config.trainer) {
				config.trainer = { type: bike.config.trainer.type, resistanceMode: bike.config.trainer.resistanceMode };
			}
			if (bike.config.bike) {
				config.bike = { name: bike.config.bike.name, ftp: bike.config.bike.ftp !== undefined ? Number(bike.config.bike.ftp) : undefined };
			}
		}
		metadata.config = config;

		const phases: BikePhase[] = [];
		const phaseNames = ['presession', 'warmup', 'main', 'cooldown', 'postsession'] as const;
		for (const name of phaseNames) {
			if (bike[name]) {
				const activities = this.parsePhase(bike[name]);
				phases.push({ name: name as any, activities });
			}
		}

		return {
			type: 'bikesession',
			metadata,
			config,
			phases,
		} as BikeSession;
	}
}

export default DCMLParser;


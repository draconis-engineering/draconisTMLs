import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import { SwimSession, SwimPhase, SwimActivity } from '../types/dsml';

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

	parseFile(filePath: string): SwimSession {
		const content = fs.readFileSync(filePath, 'utf-8');
		return this.parse(content);
	}

	parse(xml: string): SwimSession {
		const parsed = this.parser.parse(xml);
		const root = parsed.swimsession || parsed;
		return this.mapSwimSession(root);
	}

	private toBool(v: any, def = false): boolean {
		if (v === undefined || v === null) return def;
		if (typeof v === 'boolean') return v;
		if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1';
		if (typeof v === 'number') return v === 1;
		return def;
	}

	private toNum(v: any): number | undefined {
		if (v === undefined || v === null || v === '') return undefined;
		const n = Number(v);
		return isNaN(n) ? undefined : n;
	}

	private mapDuration(attrs: any) {
		const dur: any = {};
		const s = this.toNum(attrs.durationSeconds || attrs.seconds);
		const m = this.toNum(attrs.durationMinutes || attrs.minutes);
		if (s !== undefined) dur.seconds = s;
		if (m !== undefined) dur.minutes = m;
		if (dur.seconds === undefined && dur.minutes !== undefined) dur.seconds = dur.minutes * 60;
		if (dur.minutes === undefined && dur.seconds !== undefined) dur.minutes = dur.seconds / 60;
		return Object.keys(dur).length ? dur : undefined;
	}

	private mapDistance(attrs: any) {
		const dist: any = {};
		const m = this.toNum(attrs.lengthMeters || attrs.distanceMeters || attrs.meters);
		const y = this.toNum(attrs.lengthYards || attrs.distanceYards || attrs.yards);
		if (m !== undefined) dist.meters = m;
		if (y !== undefined) dist.yards = y;
		return Object.keys(dist).length ? dist : undefined;
	}

	private mapIntensity(attrs: any) {
		const inten: any = {};
		const rpe = this.toNum(attrs.RPE || attrs.rpe);
		if (rpe !== undefined) inten.rpe = rpe;
		return Object.keys(inten).length ? inten : undefined;
	}

	private mapEquipment(attrs: any) {
		const eq: any = {};
		if (attrs.paddles !== undefined) eq.paddles = this.toBool(attrs.paddles);
		if (attrs.fins !== undefined) eq.fins = this.toBool(attrs.fins);
		if (attrs.snorkel !== undefined) eq.snorkel = this.toBool(attrs.snorkel);
		if (attrs.pullbuoy !== undefined) eq.pullbuoy = this.toBool(attrs.pullbuoy);
		if (attrs.kickboard !== undefined) eq.kickboard = this.toBool(attrs.kickboard);
		if (attrs.bands !== undefined) eq.bands = this.toBool(attrs.bands);
		return Object.keys(eq).length ? eq : undefined;
	}

	private mapActivity(item: any): SwimActivity | null {
		if (!item) return null;
		const keys = Object.keys(item);
		for (let i = 0; i < keys.length; i++) {
			const k = keys[i];
			if (k === '#text') continue;
			const val = item[k];
			const attrs = typeof val === 'object' && !Array.isArray(val) ? val : item;

			if (k === 'rest') {
				return { type: 'rest', duration: this.mapDuration(attrs) || { seconds: 0 } };
			} else if (k === 'freestyle' || k === 'backstroke' || k === 'breaststroke' || k === 'butterfly' || k === 'swim') {
				return {
					type: 'stroke',
					stroke: k === 'swim' ? 'freestyle' : k as any,
					distance: this.mapDistance(attrs),
					duration: this.mapDuration(attrs),
					intensity: this.mapIntensity(attrs),
					equipment: this.mapEquipment(attrs),
				};
			} else if (k === 'drill' || k === 'superman') {
				return {
					type: 'drill',
					name: k === 'superman' ? 'superman' : (attrs.name || k),
					distance: this.mapDistance(attrs),
					duration: this.mapDuration(attrs),
					intensity: this.mapIntensity(attrs),
				};
			} else if (k === 'repeat') {
				const count = this.toNum(attrs.count) || 1;
				const items = Array.isArray(val) ? val : [val];
				const mapped: any[] = [];
				for (let j = 0; j < items.length; j++) {
					const a = this.mapActivity(items[j]);
					if (a) mapped.push(a);
				}
				// also look for direct children
				if (mapped.length === 0 && typeof val === 'object') {
					const mk = Object.keys(val);
					for (let j = 0; j < mk.length; j++) {
						if (mk[j] === '#text' || mk[j] === 'count') continue;
						const ma = this.mapActivity({ [mk[j]]: val[mk[j]] });
						if (ma) mapped.push(ma);
					}
				}
				return { type: 'repeat', count: count, items: mapped };
			} else if (k === 'drillset') {
				const items = Array.isArray(val) ? val : [val];
				const mapped: any[] = [];
				for (let j = 0; j < items.length; j++) {
					const a = this.mapActivity(items[j]);
					if (a) mapped.push(a);
				}
				if (mapped.length === 0 && typeof val === 'object') {
					const mk = Object.keys(val);
					for (let j = 0; j < mk.length; j++) {
						if (mk[j] === '#text') continue;
						const ma = this.mapActivity({ [mk[j]]: val[mk[j]] });
						if (ma) mapped.push(ma);
					}
				}
				return { type: 'drillset', items: mapped };
			} else if (k === 'bandWork') {
				return { type: 'bandwork', duration: this.mapDuration(attrs) || { minutes: 0 } };
			} else if (k === 'sauna') {
				return { type: 'sauna', duration: this.mapDuration(attrs) || { minutes: 0 } };
			}
		}
		return null;
	}

	private mapPhase(name: string, phaseData: any): SwimPhase {
		const activities: SwimActivity[] = [];
		if (!phaseData) return { name: name as any, activities };
		const process = (obj: any) => {
			if (!obj) return;
			if (Array.isArray(obj)) {
				for (let i = 0; i < obj.length; i++) process(obj[i]);
				return;
			}
			if (typeof obj === 'object') {
				const keys = Object.keys(obj);
				// if it looks like a container with known elements
				for (let i = 0; i < keys.length; i++) {
					const k = keys[i];
					if (k === '#text') continue;
					if (['drillset', 'repeat', 'freestyle', 'backstroke', 'breaststroke', 'butterfly', 'swim', 'drill', 'superman', 'rest', 'bandWork', 'sauna'].includes(k)) {
						const act = this.mapActivity({ [k]: obj[k] });
						if (act) activities.push(act);
						continue;
					}
					process(obj[k]);
				}
			}
		};
		process(phaseData);
		return { name: name as any, activities };
	}

	private mapSwimSession(root: any): SwimSession {
		const id = root.id || root.swimsession?.id;
		const session: SwimSession = {
			type: 'swimsession',
			metadata: {
				id: id,
				name: root.name,
				date: root.date,
			},
			phases: [],
		};

		const phases = ['presession', 'warmup', 'main', 'cooldown', 'postsession'];
		for (let i = 0; i < phases.length; i++) {
			if (root[phases[i]]) {
				session.phases.push(this.mapPhase(phases[i], root[phases[i]]));
			}
		}

		if (root.config) {
			session.config = root.config;
		}

		return session;
	}
}

export default DSMLParser;

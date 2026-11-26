import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import { BikeSession, BikePhase, BikeActivity, Ride, CycleRest, CycleIntervals, Blocks } from '../types/dcml';

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

    parseFile(filePath: string): BikeSession {
        const content = fs.readFileSync(filePath, 'utf-8');
        return this.parse(content);
    }

    parse(xml: string): BikeSession {
        const parsed = this.parser.parse(xml);
        const root = parsed.bikesession || parsed;
        const session: BikeSession = {
            type: 'bikesession',
            metadata: {
                id: root.id || '',
                name: root.name,
                date: root.date,
                version: root.version,
            },
            phases: [],
        };

        if (root.config) {
            const cfg: any = {};
            if (root.config.trainer) cfg.trainer = root.config.trainer;
            if (root.config.bike) cfg.bike = root.config.bike;
            session.config = cfg;
        }

        const phaseNames = ['presession', 'warmup', 'main', 'cooldown', 'postsession'];
        for (const pn of phaseNames) {
            if (root[pn]) {
                session.phases.push(this.mapPhase(pn as any, root[pn]));
            }
        }
        return session;
    }

    private toNum(v: any): number | undefined {
        if (v === undefined || v === null || v === '') return undefined;
        const n = Number(v);
        return isNaN(n) ? undefined : n;
    }

    private mapDuration(attrs: any) {
        const d: any = {};
        const m = this.toNum(attrs.durationMinutes);
        const s = this.toNum(attrs.durationSeconds);
        const h = this.toNum(attrs.durationHours);
        if (m !== undefined) d.minutes = m;
        if (s !== undefined) d.seconds = s;
        if (h !== undefined) d.hours = h;
        return Object.keys(d).length ? d : undefined;
    }

    private mapDistance(attrs: any) {
        const d: any = {};
        const km = this.toNum(attrs.distanceKm);
        const mi = this.toNum(attrs.distanceMiles);
        const m = this.toNum(attrs.distanceMeters);
        if (km !== undefined) d.kilometers = km;
        if (mi !== undefined) d.miles = mi;
        if (m !== undefined) d.meters = m;
        return Object.keys(d).length ? d : undefined;
    }

    private mapIntensity(attrs: any) {
        const i: any = {};
        const rpe = this.toNum(attrs.RPE ?? attrs.rpe);
        const hr = this.toNum(attrs.HR ?? attrs.hr);
        if (rpe !== undefined) i.rpe = rpe;
        if (hr !== undefined) i.hr = hr;
        if (attrs.pace) i.pace = String(attrs.pace);
        return Object.keys(i).length ? i : undefined;
    }

    private mapRide(tag: string, attrs: any): Ride {
        const r: any = {
            type: 'ride',
            distance: this.mapDistance(attrs),
            duration: this.mapDuration(attrs),
            intensity: this.mapIntensity(attrs),
        };
        if (tag !== 'ride') r.subtype = tag;
        const power = this.toNum(attrs.power);
        const cadence = this.toNum(attrs.cadence);
        const ftp = this.toNum(attrs.FTPpct ?? attrs.ftpPct);
        if (power !== undefined) r.power = power;
        if (cadence !== undefined) r.cadence = cadence;
        if (ftp !== undefined) r.ftpPct = ftp;
        if (attrs.notes) r.notes = String(attrs.notes);
        return r;
    }

    private mapRest(attrs: any): CycleRest {
        const r: any = { type: 'rest', duration: this.mapDuration(attrs) };
        const power = this.toNum(attrs.power);
        const ftp = this.toNum(attrs.FTPpct ?? attrs.ftpPct);
        if (power !== undefined) r.power = power;
        if (ftp !== undefined) r.ftpPct = ftp;
        return r;
    }

    private asArray(v: any): any[] {
        if (v === undefined || v === null) return [];
        return Array.isArray(v) ? v : [v];
    }

    private mapActivity(tag: string, val: any): BikeActivity | null {
        const attrs = (val && typeof val === 'object' && !Array.isArray(val)) ? val : {};
        if (tag === 'rest') return this.mapRest(attrs);
        if (['ride', 'warm', 'easy', 'steady', 'threshold', 'sweetspot', 'vo2'].includes(tag)) {
            return this.mapRide(tag, attrs);
        }
        if (tag === 'intervals') {
            const workRaw = attrs.work;
            const restRaw = attrs.rest;
            const work = Array.isArray(workRaw) ? workRaw[0] : workRaw;
            const rest = Array.isArray(restRaw) ? restRaw[0] : restRaw;
            const iv: CycleIntervals = {
                type: 'intervals',
                repeats: this.toNum(attrs.repeats) || 1,
                work: this.mapRide('ride', work || {}),
                rest: this.mapRest(rest || {}),
            };
            return iv;
        }
        if (tag === 'blocks') {
            const items: BikeActivity[] = [];
            this.collectActivities(attrs, items);
            const b: Blocks = {
                type: 'blocks',
                repeats: this.toNum(attrs.repeats) || 1,
                items,
            };
            return b;
        }
        return null;
    }

    private collectActivities(container: any, out: BikeActivity[]) {
        if (!container || typeof container !== 'object') return;
        for (const k of Object.keys(container)) {
            if (['#text', 'repeats', 'count', 'on', 'off'].includes(k)) continue;
            const vals = this.asArray(container[k]);
            for (const v of vals) {
                const act = this.mapActivity(k, v);
                if (act) out.push(act);
            }
        }
    }

    private mapPhase(name: any, phaseData: any): BikePhase {
        const activities: BikeActivity[] = [];
        this.collectActivities(phaseData, activities);
        return { name, activities };
    }
}

export default DCMLParser;

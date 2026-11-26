import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import { RunSession, RunPhase, RunActivity, Run, Walk, Strides, Drills, RunIntervals, Repeats, RunRest } from '../types/drml';

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

    parseFile(filePath: string): RunSession {
        const content = fs.readFileSync(filePath, 'utf-8');
        return this.parse(content);
    }

    parse(xml: string): RunSession {
        const parsed = this.parser.parse(xml);
        const root = parsed.runsession || parsed;
        const session: RunSession = {
            type: 'runsession',
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
            if (root.config.location) cfg.location = root.config.location;
            if (root.config.gear) cfg.gear = root.config.gear;
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

    private asArray(v: any): any[] {
        if (v === undefined || v === null) return [];
        return Array.isArray(v) ? v : [v];
    }

    private mapRun(tag: string, attrs: any): Run {
        const r: any = {
            type: 'run',
            distance: this.mapDistance(attrs),
            duration: this.mapDuration(attrs),
            intensity: this.mapIntensity(attrs),
        };
        if (tag !== 'run') r.subtype = tag;
        if (attrs.notes) r.notes = String(attrs.notes);
        return r;
    }

    private mapRest(attrs: any): RunRest {
        const r: any = { type: 'rest', duration: this.mapDuration(attrs) };
        if (attrs.type) r.restType = attrs.type;
        return r;
    }

    private mapActivity(tag: string, val: any): RunActivity | null {
        const attrs = (val && typeof val === 'object' && !Array.isArray(val)) ? val : {};
        if (tag === 'rest') return this.mapRest(attrs);
        if (tag === 'walk') {
            const w: Walk = { type: 'walk', distance: this.mapDistance(attrs), duration: this.mapDuration(attrs) };
            return w;
        }
        if (tag === 'strides') {
            const s: Strides = {
                type: 'strides',
                count: this.toNum(attrs.count),
                distanceMeters: this.toNum(attrs.distanceMeters),
                intensity: this.mapIntensity(attrs),
            };
            return s;
        }
        if (tag === 'drills') {
            const d: Drills = { type: 'drills', name: attrs.name, duration: this.mapDuration(attrs), notes: attrs.notes };
            return d;
        }
        if (['run', 'easy', 'tempo', 'threshold'].includes(tag)) {
            return this.mapRun(tag, attrs);
        }
        if (tag === 'intervals') {
            const workRaw = attrs.work;
            const restRaw = attrs.rest;
            const work = Array.isArray(workRaw) ? workRaw[0] : workRaw;
            const rest = Array.isArray(restRaw) ? restRaw[0] : restRaw;
            const iv: RunIntervals = {
                type: 'intervals',
                repeats: this.toNum(attrs.repeats) || 1,
                work: this.mapRun('run', work || {}),
                rest: this.mapRest(rest || {}),
            };
            return iv;
        }
        if (tag === 'repeats') {
            const items: RunActivity[] = [];
            this.collectActivities(attrs, items);
            const rep: Repeats = { type: 'repeats', count: this.toNum(attrs.count) || 1, items };
            return rep;
        }
        return null;
    }

    private collectActivities(container: any, out: RunActivity[]) {
        if (!container || typeof container !== 'object') return;
        for (const k of Object.keys(container)) {
            if (['#text', 'repeats', 'count'].includes(k)) continue;
            const vals = this.asArray(container[k]);
            for (const v of vals) {
                const act = this.mapActivity(k, v);
                if (act) out.push(act);
            }
        }
    }

    private mapPhase(name: any, phaseData: any): RunPhase {
        const activities: RunActivity[] = [];
        this.collectActivities(phaseData, activities);
        return { name, activities };
    }
}

export default DRMLParser;

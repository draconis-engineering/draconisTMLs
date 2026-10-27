import { RunSession, RunActivity, Run, Walk, Strides, Drills, RunIntervals, Repeats, RunRest } from '../types/drml';

function formatAttrs(attrs: Record<string, any>) {
	const parts: string[] = [];
	for (const [k, v] of Object.entries(attrs)) {
		if (v === undefined || v === null) continue;
		if (typeof v === 'boolean') {
			if (v === true) parts.push(`${k}="true"`);
			else parts.push(`${k}="false"`);
			continue;
		}
		parts.push(`${k}="${String(v)}"`);
	}
	return parts.length > 0 ? ' ' + parts.join(' ') : '';
}

function durationAttrsDRML(d: any): Record<string, any> {
	if (!d) return {};
	const res: Record<string, any> = {};
	if (d.minutes !== undefined && d.minutes !== null) res.durationMinutes = d.minutes;
	if (d.seconds !== undefined && d.seconds !== null) {
		if (res.durationMinutes === undefined) res.durationSeconds = d.seconds;
		else res.durationSeconds = d.seconds;
	}
	if (d.hours !== undefined && d.hours !== null) res.durationHours = d.hours;
	return res;
}

function distanceAttrsDRML(d: any): Record<string, any> {
	if (!d) return {};
	const res: Record<string, any> = {};
	if (d.kilometers !== undefined && d.kilometers !== null) res.distanceKm = d.kilometers;
	if (d.miles !== undefined && d.miles !== null) res.distanceMiles = d.miles;
	if (d.meters !== undefined && d.meters !== null) res.distanceMeters = d.meters;
	return res;
}

function intensityAttrsDRML(i: any): Record<string, any> {
	if (!i) return {};
	const res: Record<string, any> = {};
	if (i.rpe !== undefined && i.rpe !== null) res.RPE = i.rpe;
	if (i.hr !== undefined && i.hr !== null) res.HR = i.hr;
	if (i.pace !== undefined && i.pace !== null) res.pace = i.pace;
	return res;
}

function writeRunActivity(act: RunActivity, indent: string): string {
	if (act.type === 'rest') {
		const r = act as RunRest;
		const attrs = { ...durationAttrsDRML(r.duration) };
		if (r.restType) attrs.type = r.restType;
		return `${indent}<rest${formatAttrs(attrs)}/>\n`;
	}
	if (act.type === 'walk') {
		const w = act as Walk;
		const attrs = { ...distanceAttrsDRML(w.distance), ...durationAttrsDRML(w.duration) };
		return `${indent}<walk${formatAttrs(attrs)}/>\n`;
	}
	if (act.type === 'strides') {
		const s = act as Strides;
		const attrs: any = {};
		if (s.count !== undefined) attrs.count = s.count;
		if (s.distanceMeters !== undefined) attrs.distanceMeters = s.distanceMeters;
		if (s.intensity?.rpe !== undefined) attrs.RPE = s.intensity.rpe;
		return `${indent}<strides${formatAttrs(attrs)}/>\n`;
	}
	if (act.type === 'drills') {
		const d = act as Drills;
		const attrs = { ...durationAttrsDRML(d.duration) };
		if (d.name) attrs.name = d.name;
		if ((d as any).notes) attrs.notes = (d as any).notes;
		return `${indent}<drills${formatAttrs(attrs)}/>\n`;
	}
	if (act.type === 'run') {
		const rn = act as Run;
		const attrs = { ...distanceAttrsDRML(rn.distance), ...durationAttrsDRML(rn.duration), ...intensityAttrsDRML(rn.intensity) };
		if ((rn as any).notes) attrs.notes = (rn as any).notes;
		const tag = rn.subtype || 'run';
		return `${indent}<${tag}${formatAttrs(attrs)}/>\n`;
	}
	if (act.type === 'intervals') {
		const iv = act as RunIntervals;
		let out = `${indent}<intervals repeats="${iv.repeats}">\n`;
		const w = iv.work as Run;
		out += `${indent}        <work${formatAttrs({ ...distanceAttrsDRML(w.distance), ...durationAttrsDRML(w.duration), ...intensityAttrsDRML(w.intensity) })}/>\n`;
		const r = iv.rest as RunRest;
		out += `${indent}        <rest${formatAttrs({ ...durationAttrsDRML(r.duration), type: r.restType })}/>\n`;
		out += `${indent}</intervals>\n`;
		return out;
	}
	if (act.type === 'repeats') {
		const rep = act as Repeats;
		let out = `${indent}<repeats count="${rep.count}">\n`;
		for (const item of rep.items) {
			out += writeRunActivity(item, indent + '        ');
		}
		out += `${indent}</repeats>\n`;
		return out;
	}
	return '';
}

export class DRMLWriter {
	write(session: RunSession): string {
		let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
		xml += `<runsession id="${session.metadata.id || ''}" xmlns="https://draconis.engineering/dtml/drml"`;
		if (session.metadata.name) xml += ` name="${session.metadata.name}"`;
		if (session.metadata.date) xml += ` date="${session.metadata.date}"`;
		if (session.metadata.version) xml += ` version="${session.metadata.version}"`;
		xml += `>\n`;

		if (session.config || session.metadata.config) {
			const cfg: any = session.config || session.metadata.config;
			xml += `    <config>\n`;
			if (cfg?.location) {
				xml += `        <location${formatAttrs(cfg.location)}/>\n`;
			}
			if (cfg?.gear) {
				xml += `        <gear${formatAttrs(cfg.gear)}/>\n`;
			}
			xml += `    </config>\n\n`;
		}

		for (const phase of session.phases) {
			xml += `    <${phase.name}>\n`;
			for (const act of phase.activities) {
				xml += writeRunActivity(act, '        ');
			}
			xml += `    </${phase.name}>\n\n`;
		}

		xml += `</runsession>\n`;
		return xml;
	}
}

export default DRMLWriter;

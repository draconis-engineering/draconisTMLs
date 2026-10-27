import { BikeSession, BikeActivity, Ride, CycleRest, CycleIntervals, Blocks } from '../types/dcml';

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

function durationAttrsDCML(d: any): Record<string, any> {
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

function distanceAttrsDCML(d: any): Record<string, any> {
	if (!d) return {};
	const res: Record<string, any> = {};
	if (d.kilometers !== undefined && d.kilometers !== null) res.distanceKm = d.kilometers;
	if (d.miles !== undefined && d.miles !== null) res.distanceMiles = d.miles;
	if (d.meters !== undefined && d.meters !== null) res.distanceMeters = d.meters;
	return res;
}

function intensityAttrsDCML(i: any): Record<string, any> {
	if (!i) return {};
	const res: Record<string, any> = {};
	if (i.rpe !== undefined && i.rpe !== null) res.RPE = i.rpe;
	if (i.hr !== undefined && i.hr !== null) res.HR = i.hr;
	if (i.pace !== undefined && i.pace !== null) res.pace = i.pace;
	return res;
}

function rideAttrs(r: Ride): Record<string, any> {
	const attrs: any = { ...distanceAttrsDCML(r.distance), ...durationAttrsDCML(r.duration), ...intensityAttrsDCML(r.intensity) };
	if ((r as any).power !== undefined) attrs.power = (r as any).power;
	if ((r as any).cadence !== undefined) attrs.cadence = (r as any).cadence;
	if ((r as any).ftpPct !== undefined) attrs.FTPpct = (r as any).ftpPct;
	if ((r as any).notes) attrs.notes = (r as any).notes;
	return attrs;
}

function restAttrs(r: CycleRest): Record<string, any> {
	const attrs: any = { ...durationAttrsDCML(r.duration) };
	if ((r as any).power !== undefined) attrs.power = (r as any).power;
	if ((r as any).ftpPct !== undefined) attrs.FTPpct = (r as any).ftpPct;
	return attrs;
}

function writeBikeActivity(act: BikeActivity, indent: string): string {
	if (act.type === 'rest') {
		const r = act as CycleRest;
		return `${indent}<rest${formatAttrs(restAttrs(r))}/>\n`;
	}
	if (act.type === 'ride') {
		const rn = act as Ride;
		const attrs = rideAttrs(rn);
		const tag = rn.subtype || 'ride';
		return `${indent}<${tag}${formatAttrs(attrs)}/>\n`;
	}
	if (act.type === 'intervals') {
		const iv = act as CycleIntervals;
		let out = `${indent}<intervals repeats="${iv.repeats}">\n`;
		const w = iv.work as Ride;
		out += `${indent}        <work${formatAttrs(rideAttrs(w))}/>\n`;
		const r = iv.rest as CycleRest;
		out += `${indent}        <rest${formatAttrs(restAttrs(r))}/>\n`;
		out += `${indent}</intervals>\n`;
		return out;
	}
	if (act.type === 'blocks') {
		const b = act as Blocks;
		let out = `${indent}<blocks repeats="${b.repeats}">\n`;
		for (const item of b.items) {
			out += writeBikeActivity(item, indent + '        ');
		}
		out += `${indent}</blocks>\n`;
		return out;
	}
	return '';
}

export class DCMLWriter {
	write(session: BikeSession): string {
		let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
		xml += `<bikesession id="${session.metadata.id || ''}" xmlns="https://draconis.engineering/dtml/dcml"`;
		if (session.metadata.name) xml += ` name="${session.metadata.name}"`;
		if (session.metadata.date) xml += ` date="${session.metadata.date}"`;
		if (session.metadata.version) xml += ` version="${session.metadata.version}"`;
		xml += `>\n`;

		if (session.config || session.metadata.config) {
			const cfg: any = session.config || session.metadata.config;
			xml += `    <config>\n`;
			if (cfg?.trainer) {
				xml += `        <trainer${formatAttrs(cfg.trainer)}/>\n`;
			}
			if (cfg?.bike) {
				xml += `        <bike${formatAttrs(cfg.bike)}/>\n`;
			}
			xml += `    </config>\n\n`;
		}

		for (const phase of session.phases) {
			xml += `    <${phase.name}>\n`;
			for (const act of phase.activities) {
				xml += writeBikeActivity(act, '        ');
			}
			xml += `    </${phase.name}>\n\n`;
		}

		xml += `</bikesession>\n`;
		return xml;
	}
}

export default DCMLWriter;

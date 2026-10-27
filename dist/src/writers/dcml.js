"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DCMLWriter = void 0;
function formatAttrs(attrs) {
    const parts = [];
    for (const [k, v] of Object.entries(attrs)) {
        if (v === undefined || v === null)
            continue;
        if (typeof v === 'boolean') {
            if (v === true)
                parts.push(`${k}="true"`);
            else
                parts.push(`${k}="false"`);
            continue;
        }
        parts.push(`${k}="${String(v)}"`);
    }
    return parts.length > 0 ? ' ' + parts.join(' ') : '';
}
function durationAttrsDCML(d) {
    if (!d)
        return {};
    const res = {};
    if (d.minutes !== undefined && d.minutes !== null)
        res.durationMinutes = d.minutes;
    if (d.seconds !== undefined && d.seconds !== null) {
        if (res.durationMinutes === undefined)
            res.durationSeconds = d.seconds;
        else
            res.durationSeconds = d.seconds;
    }
    if (d.hours !== undefined && d.hours !== null)
        res.durationHours = d.hours;
    return res;
}
function distanceAttrsDCML(d) {
    if (!d)
        return {};
    const res = {};
    if (d.kilometers !== undefined && d.kilometers !== null)
        res.distanceKm = d.kilometers;
    if (d.miles !== undefined && d.miles !== null)
        res.distanceMiles = d.miles;
    if (d.meters !== undefined && d.meters !== null)
        res.distanceMeters = d.meters;
    return res;
}
function intensityAttrsDCML(i) {
    if (!i)
        return {};
    const res = {};
    if (i.rpe !== undefined && i.rpe !== null)
        res.RPE = i.rpe;
    if (i.hr !== undefined && i.hr !== null)
        res.HR = i.hr;
    if (i.pace !== undefined && i.pace !== null)
        res.pace = i.pace;
    return res;
}
function rideAttrs(r) {
    const attrs = { ...distanceAttrsDCML(r.distance), ...durationAttrsDCML(r.duration), ...intensityAttrsDCML(r.intensity) };
    if (r.power !== undefined)
        attrs.power = r.power;
    if (r.cadence !== undefined)
        attrs.cadence = r.cadence;
    if (r.ftpPct !== undefined)
        attrs.FTPpct = r.ftpPct;
    if (r.notes)
        attrs.notes = r.notes;
    return attrs;
}
function restAttrs(r) {
    const attrs = { ...durationAttrsDCML(r.duration) };
    if (r.power !== undefined)
        attrs.power = r.power;
    if (r.ftpPct !== undefined)
        attrs.FTPpct = r.ftpPct;
    return attrs;
}
function writeBikeActivity(act, indent) {
    if (act.type === 'rest') {
        const r = act;
        return `${indent}<rest${formatAttrs(restAttrs(r))}/>\n`;
    }
    if (act.type === 'ride') {
        const rn = act;
        const attrs = rideAttrs(rn);
        const tag = rn.subtype || 'ride';
        return `${indent}<${tag}${formatAttrs(attrs)}/>\n`;
    }
    if (act.type === 'intervals') {
        const iv = act;
        let out = `${indent}<intervals repeats="${iv.repeats}">\n`;
        const w = iv.work;
        out += `${indent}        <work${formatAttrs(rideAttrs(w))}/>\n`;
        const r = iv.rest;
        out += `${indent}        <rest${formatAttrs(restAttrs(r))}/>\n`;
        out += `${indent}</intervals>\n`;
        return out;
    }
    if (act.type === 'blocks') {
        const b = act;
        let out = `${indent}<blocks repeats="${b.repeats}">\n`;
        for (const item of b.items) {
            out += writeBikeActivity(item, indent + '        ');
        }
        out += `${indent}</blocks>\n`;
        return out;
    }
    return '';
}
class DCMLWriter {
    write(session) {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<bikesession id="${session.metadata.id || ''}" xmlns="https://draconis.engineering/dtml/dcml"`;
        if (session.metadata.name)
            xml += ` name="${session.metadata.name}"`;
        if (session.metadata.date)
            xml += ` date="${session.metadata.date}"`;
        if (session.metadata.version)
            xml += ` version="${session.metadata.version}"`;
        xml += `>\n`;
        if (session.config || session.metadata.config) {
            const cfg = session.config || session.metadata.config;
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
exports.DCMLWriter = DCMLWriter;
exports.default = DCMLWriter;

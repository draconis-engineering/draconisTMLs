"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DSMLWriter = void 0;
function boolAttr(v) {
    if (v === true)
        return 'true';
    if (v === false)
        return 'false';
    return undefined;
}
function formatAttrs(attrs) {
    const parts = [];
    for (const [k, v] of Object.entries(attrs)) {
        if (v === undefined || v === null)
            continue;
        if (typeof v === 'boolean') {
            const bv = boolAttr(v);
            if (bv)
                parts.push(`${k}="${bv}"`);
            continue;
        }
        parts.push(`${k}="${String(v)}"`);
    }
    return parts.length > 0 ? ' ' + parts.join(' ') : '';
}
function durationAttrs(d) {
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
function distanceAttrs(d) {
    if (!d)
        return {};
    const res = {};
    if (d.meters !== undefined && d.meters !== null)
        res.lengthMeters = d.meters;
    if (d.yards !== undefined && d.yards !== null)
        res.lengthYards = d.yards;
    return res;
}
function intensityAttrs(i) {
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
function equipmentAttrs(e) {
    if (!e)
        return {};
    const res = {};
    if (e.paddles !== undefined)
        res.paddles = e.paddles;
    if (e.fins !== undefined)
        res.fins = e.fins;
    if (e.snorkel !== undefined)
        res.snorkel = e.snorkel;
    if (e.pullbuoy !== undefined)
        res.pullbuoy = e.pullbuoy;
    if (e.kickboard !== undefined)
        res.kickboard = e.kickboard;
    if (e.bands !== undefined)
        res.bands = e.bands;
    return res;
}
function writeActivity(act, indent) {
    if (act.type === 'rest') {
        const r = act;
        const attrs = {};
        if (r.duration.minutes !== undefined && r.duration.minutes !== null)
            attrs.lengthMinutes = r.duration.minutes;
        if (r.duration.seconds !== undefined && r.duration.seconds !== null) {
            if (attrs.lengthMinutes === undefined)
                attrs.lengthSeconds = r.duration.seconds;
            else
                attrs.lengthSeconds = r.duration.seconds;
        }
        if (r.duration.hours !== undefined && r.duration.hours !== null)
            attrs.lengthHours = r.duration.hours;
        if (r.notes)
            attrs.notes = r.notes;
        return `${indent}<rest${formatAttrs(attrs)}/>\n`;
    }
    if (act.type === 'bandwork') {
        const b = act;
        const attrs = {};
        if (b.duration.minutes !== undefined && b.duration.minutes !== null)
            attrs.durationMinutes = b.duration.minutes;
        if (b.duration.seconds !== undefined && b.duration.seconds !== null && attrs.durationMinutes === undefined)
            attrs.durationSeconds = b.duration.seconds;
        if (b.intensity?.rpe !== undefined)
            attrs.RPE = b.intensity.rpe;
        return `${indent}<bandWork${formatAttrs(attrs)}/>\n`;
    }
    if (act.type === 'sauna') {
        const s = act;
        const attrs = {};
        if (s.duration.minutes !== undefined && s.duration.minutes !== null)
            attrs.durationMinutes = s.duration.minutes;
        if (s.temperatureCelsius !== undefined)
            attrs.temperatureCelsius = s.temperatureCelsius;
        return `${indent}<sauna${formatAttrs(attrs)}/>\n`;
    }
    if (act.type === 'drill') {
        const d = act;
        const attrs = { ...distanceAttrs(d.distance), ...durationAttrs(d.duration), ...intensityAttrs(d.intensity) };
        if (d.name && d.name === 'superman') {
            return `${indent}<superman${formatAttrs(attrs)}/>\n`;
        }
        if (d.name) {
            attrs.name = d.name;
        }
        if (d.notes)
            attrs.notes = d.notes;
        return `${indent}<drill${formatAttrs(attrs)}/>\n`;
    }
    if (act.type === 'stroke') {
        const st = act;
        const attrs = { ...distanceAttrs(st.distance), ...durationAttrs(st.duration), ...intensityAttrs(st.intensity), ...equipmentAttrs(st.equipment) };
        if (st.notes)
            attrs.notes = st.notes;
        const tag = st.stroke === 'freestyle' ? 'freestyle' : st.stroke === 'backstroke' ? 'backstroke' : st.stroke === 'breaststroke' ? 'breaststroke' : st.stroke === 'butterfly' ? 'butterfly' : st.stroke === 'medley' ? 'medley' : 'swim';
        return `${indent}<${tag}${formatAttrs(attrs)}/>\n`;
    }
    if (act.type === 'drillset') {
        const ds = act;
        let out = `${indent}<drillset>\n`;
        for (const item of ds.items) {
            out += writeActivity(item, indent + '        ');
        }
        out += `${indent}</drillset>\n`;
        return out;
    }
    if (act.type === 'repeat') {
        const rep = act;
        let out = `${indent}<repeat count="${rep.count}">\n`;
        for (const item of rep.items) {
            out += writeActivity(item, indent + '        ');
        }
        out += `${indent}</repeat>\n`;
        return out;
    }
    return '';
}
class DSMLWriter {
    write(session) {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<swimsession id="${session.metadata.id || ''}" xmlns="https://draconis.engineering/dtml/dsml"`;
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
            if (cfg?.pool) {
                xml += `        <pool${formatAttrs(cfg.pool)}/>\n`;
            }
            if (cfg?.gear) {
                xml += `        <gear${formatAttrs(equipmentAttrs(cfg.gear))}/>\n`;
            }
            xml += `    </config>\n\n`;
        }
        for (const phase of session.phases) {
            xml += `    <${phase.name}>\n`;
            for (const act of phase.activities) {
                xml += writeActivity(act, '        ');
            }
            xml += `    </${phase.name}>\n\n`;
        }
        xml += `</swimsession>\n`;
        return xml;
    }
    writeFile(session, filePath) {
        const fs = require('fs');
        fs.writeFileSync(filePath, this.write(session));
    }
}
exports.DSMLWriter = DSMLWriter;
exports.default = DSMLWriter;

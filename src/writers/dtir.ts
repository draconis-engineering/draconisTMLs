import { DTIRTraining, DTIRPhase, DTIRBlock, DTIRWork } from '../types/dtir';

function esc(s: any): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function attrs(obj: Record<string, any>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue;
    parts.push(`${k}="${esc(v)}"`);
  }
  return parts.length ? ' ' + parts.join(' ') : '';
}

export class DTIRWriter {
  write(training: DTIRTraining): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<training xmlns="https://draconis.engineering/dtml/dtir" id="${esc(training.id)}"${training.version ? ` version="${esc(training.version)}"` : ''}>\n`;
    xml += `  <metadata>\n`;
    const md = training.metadata || ({} as any);
    if (md.name) xml += `    <name>${esc(md.name)}</name>\n`;
    if (md.description) xml += `    <description>${esc(md.description)}</description>\n`;
    if (md.athlete) xml += `    <athlete>${esc(md.athlete)}</athlete>\n`;
    if (md.coach) xml += `    <coach>${esc(md.coach)}</coach>\n`;
    if (md.date) xml += `    <date>${esc(md.date)}</date>\n`;
    if ((md as any).created) xml += `    <created>${esc((md as any).created)}</created>\n`;
    if ((md as any).tags) xml += `    <tags>${esc((md as any).tags)}</tags>\n`;
    xml += `  </metadata>\n`;
    xml += `  <sport>${esc(training.sport)}</sport>\n`;

    const s = training.session || { phases: [] };
    xml += `  <session${attrs({ durationSeconds: s.durationSeconds, distanceMeters: s.distanceMeters, tss: s.tss })}>\n`;
    xml += `    <phases>\n`;
    for (const phase of (s.phases || [])) {
      xml += this.writePhase(phase);
    }
    xml += `    </phases>\n`;
    xml += `  </session>\n`;
    xml += `</training>\n`;
    return xml;
  }

  private writePhase(phase: DTIRPhase): string {
    let xml = `      <phase${attrs({ name: phase.name, order: phase.order })}>\n`;
    xml += `        <blocks>\n`;
    for (const block of (phase.blocks || [])) {
      xml += this.writeBlock(block);
    }
    xml += `        </blocks>\n`;
    xml += `      </phase>\n`;
    return xml;
  }

  private writeBlock(block: DTIRBlock): string {
    let xml = `          <block${attrs({ type: block.type, repeat: block.repeat ?? 1 })}>\n`;
    for (const work of (block.work || [])) {
      xml += this.writeWork(work);
    }
    if (block.rest) {
      xml += `            <rest${attrs({ durationSeconds: block.rest.durationSeconds, type: block.rest.type })}/>\n`;
    }
    xml += `          </block>\n`;
    return xml;
  }

  private writeWork(work: DTIRWork): string {
    const m = work.metrics || {};
    let xml = `            <work${attrs({ name: work.name, stroke: work.stroke })}>\n`;
    xml += `              <metrics${attrs({
      distanceMeters: m.distanceMeters,
      durationSeconds: m.durationSeconds,
      pacePer100m: m.pacePer100m,
      pacePerKm: m.pacePerKm,
      powerWatts: m.powerWatts,
      powerPctFTP: m.powerPctFTP,
      hrBpm: m.hrBpm,
      hrPctMax: m.hrPctMax,
      rpe: m.rpe,
      cadence: m.cadence,
    })}/>\n`;
    const eq = work.equipment;
    if (eq && Object.values(eq).some(v => v !== undefined)) {
      xml += `              <equipment${attrs(eq as any)}/>\n`;
    }
    if (work.notes) xml += `              <notes>${esc(work.notes)}</notes>\n`;
    xml += `            </work>\n`;
    return xml;
  }
}

export default DTIRWriter;

import { SwimSession } from '../types/dsml';

export class DSMLWriter {
  write(session: SwimSession): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<swimsession id="${this.escape(session.metadata.id)}" xmlns="https://draconis.engineering/dtml/dsml"`;
    if (session.metadata.name) xml += ` name="${this.escape(session.metadata.name)}"`;
    if (session.metadata.date) xml += ` date="${this.escape(session.metadata.date)}"`;
    xml += '>\n';

    if (session.config) {
      xml += '    <config>\n';
      if (session.config.pool) {
        const p = session.config.pool;
        xml += '        <pool';
        if (p.lengthMeters !== undefined) xml += ` lengthMeters="${p.lengthMeters}"`;
        if (p.lengthYards !== undefined) xml += ` lengthYards="${p.lengthYards}"`;
        if (p.laneWidthMeters !== undefined) xml += ` laneWidthMeters="${p.laneWidthMeters}"`;
        if (p.depthMeters !== undefined) xml += ` depthMeters="${p.depthMeters}"`;
        if (p.indoor !== undefined) xml += ` indoor="${p.indoor}"`;
        xml += '/>\n';
      }
      if (session.config.gear) {
        const g = session.config.gear;
        xml += '        <gear';
        if (g.paddles !== undefined) xml += ` paddles="${g.paddles}"`;
        if (g.fins !== undefined) xml += ` fins="${g.fins}"`;
        if (g.snorkel !== undefined) xml += ` snorkel="${g.snorkel}"`;
        if (g.pullbuoy !== undefined) xml += ` pullbuoy="${g.pullbuoy}"`;
        if (g.kickboard !== undefined) xml += ` kickboard="${g.kickboard}"`;
        if (g.bands !== undefined) xml += ` bands="${g.bands}"`;
        xml += '/>\n';
      }
      xml += '    </config>\n\n';
    }

    for (let pi = 0; pi < session.phases.length; pi++) {
      const phase = session.phases[pi];
      xml += `    <${phase.name}>\n`;
      for (let ai = 0; ai < phase.activities.length; ai++) {
        xml += this.writeActivity(phase.activities[ai], 8);
      }
      xml += `    </${phase.name}>\n\n`;
    }

    xml += '</swimsession>\n';
    return xml;
  }

  private writeActivity(activity: any, indent: number): string {
    const pad = ' '.repeat(indent);
    if (activity.type === 'rest') {
      let s = pad + '<rest';
      if (activity.duration?.seconds !== undefined && activity.duration?.minutes === undefined) s += ` lengthSeconds="${activity.duration.seconds}"`;
      else if (activity.duration?.minutes !== undefined) s += ` lengthMinutes="${activity.duration.minutes}"`;
      else if (activity.duration?.seconds !== undefined) s += ` lengthSeconds="${activity.duration.seconds}"`;
      if (activity.notes) s += ` notes="${this.escape(activity.notes)}"`;
      s += '/>\n';
      return s;
    } else if (activity.type === 'stroke') {
      const stroke = activity.stroke === 'freestyle' && activity.name === undefined ? 'freestyle' : activity.stroke || 'freestyle';
      // use specific stroke element if known
      let elem = stroke;
      if (elem === 'freestyle') elem = 'freestyle';
      else if (elem === 'backstroke') elem = 'backstroke';
      else if (elem === 'breaststroke') elem = 'breaststroke';
      else if (elem === 'butterfly') elem = 'butterfly';
      else elem = 'swim';
      let s = pad + `<${elem}`;
      if (activity.distance?.meters !== undefined) s += ` lengthMeters="${activity.distance.meters}"`;
      if (activity.distance?.yards !== undefined) s += ` lengthYards="${activity.distance.yards}"`;
      if (activity.duration?.seconds !== undefined) s += ` durationSeconds="${activity.duration.seconds}"`;
      if (activity.duration?.minutes !== undefined) s += ` durationMinutes="${activity.duration.minutes}"`;
      if (activity.intensity?.rpe !== undefined) s += ` RPE="${activity.intensity.rpe}"`;
      if (activity.equipment?.paddles !== undefined) s += ` paddles="${activity.equipment.paddles}"`;
      if (activity.equipment?.fins !== undefined) s += ` fins="${activity.equipment.fins}"`;
      if (activity.equipment?.snorkel !== undefined) s += ` snorkel="${activity.equipment.snorkel}"`;
      if (activity.equipment?.pullbuoy !== undefined) s += ` pullbuoy="${activity.equipment.pullbuoy}"`;
      if (activity.notes) s += ` notes="${this.escape(activity.notes)}"`;
      s += '/>\n';
      return s;
    } else if (activity.type === 'drill') {
      if (activity.name === 'superman') {
        let s = pad + '<superman';
        if (activity.distance?.meters !== undefined) s += ` lengthMeters="${activity.distance.meters}"`;
        if (activity.duration?.seconds !== undefined) s += ` durationSeconds="${activity.duration.seconds}"`;
        if (activity.duration?.minutes !== undefined) s += ` durationMinutes="${activity.duration.minutes}"`;
        s += '/>\n';
        return s;
      }
      let s = pad + '<drill';
      if (activity.name) s += ` name="${this.escape(activity.name)}"`;
      if (activity.distance?.meters !== undefined) s += ` lengthMeters="${activity.distance.meters}"`;
      if (activity.duration?.seconds !== undefined) s += ` durationSeconds="${activity.duration.seconds}"`;
      if (activity.duration?.minutes !== undefined) s += ` durationMinutes="${activity.duration.minutes}"`;
      if (activity.intensity?.rpe !== undefined) s += ` RPE="${activity.intensity.rpe}"`;
      s += '/>\n';
      return s;
    } else if (activity.type === 'drillset') {
      let s = pad + '<drillset>\n';
      for (let i = 0; i < activity.items.length; i++) {
        s += this.writeActivity(activity.items[i], indent + 4);
      }
      s += pad + '</drillset>\n';
      return s;
    } else if (activity.type === 'repeat') {
      let s = pad + `<repeat count="${activity.count || 1}">\n`;
      for (let i = 0; i < activity.items.length; i++) {
        s += this.writeActivity(activity.items[i], indent + 4);
      }
      s += pad + '</repeat>\n';
      return s;
    } else if (activity.type === 'bandwork') {
      let s = pad + '<bandWork';
      if (activity.duration?.minutes !== undefined) s += ` durationMinutes="${activity.duration.minutes}"`;
      else if (activity.duration?.seconds !== undefined) s += ` durationSeconds="${activity.duration.seconds}"`;
      s += '/>\n';
      return s;
    } else if (activity.type === 'sauna') {
      let s = pad + '<sauna';
      if (activity.duration?.minutes !== undefined) s += ` durationMinutes="${activity.duration.minutes}"`;
      else if (activity.duration?.seconds !== undefined) s += ` durationSeconds="${activity.duration.seconds}"`;
      if (activity.temperatureCelsius !== undefined) s += ` temperatureCelsius="${activity.temperatureCelsius}"`;
      s += '/>\n';
      return s;
    }
    return '';
  }

  private escape(s: string): string {
    if (!s) return s;
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

export default DSMLWriter;

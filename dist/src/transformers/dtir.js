"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DTIRTransformer = void 0;
class DTIRTransformer {
    toDTIR(session) {
        if (session.type === 'swimsession') {
            return this.swimToDTIR(session);
        }
        else if (session.type === 'runsession') {
            return this.runToDTIR(session);
        }
        else if (session.type === 'bikesession') {
            return this.bikeToDTIR(session);
        }
        throw new Error('Unknown session type');
    }
    swimToDTIR(session) {
        const training = {
            id: session.metadata.id,
            metadata: {
                id: session.metadata.id,
                name: session.metadata.name,
                description: session.metadata.description,
                athlete: session.metadata.athlete,
                coach: session.metadata.coach,
                date: session.metadata.date,
            },
            sport: 'swim',
            session: {
                phases: session.phases.map((phase, idx) => ({
                    name: phase.name,
                    order: idx,
                    blocks: phase.activities.map(act => {
                        if (act.type === 'repeat') {
                            return {
                                type: 'set',
                                repeat: act.count,
                                work: act.items.filter(i => i.type === 'stroke' || i.type === 'drill').map((item) => ({
                                    name: item.name || item.stroke,
                                    stroke: item.stroke,
                                    metrics: {
                                        distanceMeters: item.distance?.meters,
                                        durationSeconds: item.duration?.seconds || (item.duration?.minutes ? item.duration.minutes * 60 : undefined),
                                        rpe: item.intensity?.rpe,
                                    },
                                    equipment: item.equipment || {},
                                })),
                                rest: act.items.find(i => i.type === 'rest') ? {
                                    durationSeconds: act.items.find(i => i.type === 'rest')?.duration?.seconds ||
                                        (act.items.find(i => i.type === 'rest')?.duration?.minutes * 60)
                                } : undefined,
                            };
                        }
                        if (act.type === 'stroke') {
                            return {
                                type: 'continuous',
                                repeat: 1,
                                work: [{
                                        name: act.stroke,
                                        stroke: act.stroke,
                                        metrics: {
                                            distanceMeters: act.distance?.meters,
                                            durationSeconds: act.duration?.seconds || (act.duration?.minutes ? act.duration.minutes * 60 : undefined),
                                            rpe: act.intensity?.rpe,
                                        },
                                        equipment: act.equipment || {},
                                    }],
                            };
                        }
                        return {
                            type: 'continuous',
                            repeat: 1,
                            work: [{
                                    name: act.type,
                                    metrics: {},
                                }],
                        };
                    }),
                })),
            },
        };
        return training;
    }
    toSeconds(d) {
        if (!d)
            return undefined;
        if (d.seconds !== undefined && d.seconds !== null)
            return Number(d.seconds);
        if (d.minutes !== undefined && d.minutes !== null)
            return Number(d.minutes) * 60;
        if (d.hours !== undefined && d.hours !== null)
            return Number(d.hours) * 3600;
        return undefined;
    }
    toMeters(dist) {
        if (!dist)
            return undefined;
        if (dist.meters !== undefined && dist.meters !== null)
            return Number(dist.meters);
        if (dist.kilometers !== undefined && dist.kilometers !== null)
            return Number(dist.kilometers) * 1000;
        if (dist.miles !== undefined && dist.miles !== null)
            return Number(dist.miles) * 1609.344;
        if (dist.yards !== undefined && dist.yards !== null)
            return Number(dist.yards) * 0.9144;
        return undefined;
    }
    runToDTIR(session) {
        const training = {
            id: session.metadata.id,
            metadata: {
                id: session.metadata.id,
                name: session.metadata.name,
                description: session.metadata.description,
                athlete: session.metadata.athlete,
                coach: session.metadata.coach,
                date: session.metadata.date,
            },
            sport: 'run',
            session: {
                phases: session.phases.map((phase, idx) => ({
                    name: phase.name,
                    order: idx,
                    blocks: phase.activities.map(act => {
                        if (act.type === 'repeats') {
                            const rep = act;
                            return {
                                type: 'set',
                                repeat: rep.count,
                                work: (rep.items || []).filter((i) => i && i.type !== 'rest').map((item) => ({
                                    name: item.subtype || item.type,
                                    metrics: {
                                        distanceMeters: this.toMeters(item.distance),
                                        durationSeconds: this.toSeconds(item.duration),
                                        rpe: item.intensity?.rpe,
                                    },
                                })),
                                rest: (rep.items || []).find((i) => i && i.type === 'rest') ? {
                                    durationSeconds: this.toSeconds((rep.items || []).find((i) => i && i.type === 'rest')?.duration),
                                } : undefined,
                            };
                        }
                        if (act.type === 'intervals') {
                            const iv = act;
                            return {
                                type: 'set',
                                repeat: iv.repeats,
                                work: [{
                                        name: iv.work?.subtype || 'work',
                                        metrics: {
                                            distanceMeters: this.toMeters(iv.work?.distance),
                                            durationSeconds: this.toSeconds(iv.work?.duration),
                                            rpe: iv.work?.intensity?.rpe,
                                        },
                                    }],
                                rest: {
                                    durationSeconds: this.toSeconds(iv.rest?.duration),
                                },
                            };
                        }
                        if (act.type === 'run' || act.type === 'walk' || act.type === 'strides' || act.type === 'drills') {
                            return {
                                type: 'continuous',
                                repeat: 1,
                                work: [{
                                        name: act.subtype || act.type,
                                        metrics: {
                                            distanceMeters: this.toMeters(act.distance) || act.distanceMeters,
                                            durationSeconds: this.toSeconds(act.duration),
                                            rpe: act.intensity?.rpe,
                                        },
                                    }],
                            };
                        }
                        if (act.type === 'rest') {
                            return {
                                type: 'continuous',
                                repeat: 1,
                                work: [{
                                        name: 'rest',
                                        metrics: {
                                            durationSeconds: this.toSeconds(act.duration),
                                        },
                                    }],
                            };
                        }
                        return {
                            type: 'continuous',
                            repeat: 1,
                            work: [{ name: act.type, metrics: {} }],
                        };
                    }),
                })),
            },
        };
        return training;
    }
    bikeToDTIR(session) {
        const training = {
            id: session.metadata.id,
            metadata: {
                id: session.metadata.id,
                name: session.metadata.name,
                description: session.metadata.description,
                athlete: session.metadata.athlete,
                coach: session.metadata.coach,
                date: session.metadata.date,
            },
            sport: 'bike',
            session: {
                phases: session.phases.map((phase, idx) => ({
                    name: phase.name,
                    order: idx,
                    blocks: phase.activities.map(act => {
                        if (act.type === 'blocks') {
                            const blk = act;
                            // Flatten first level for simplicity
                            return {
                                type: 'set',
                                repeat: blk.repeats,
                                work: (blk.items || []).filter((i) => i && i.type !== 'rest').map((item) => {
                                    if (item.type === 'intervals') {
                                        return {
                                            name: 'intervals',
                                            metrics: {
                                                durationSeconds: this.toSeconds(item.work?.duration),
                                                power: item.work?.power,
                                                ftpPct: item.work?.ftpPct,
                                            },
                                        };
                                    }
                                    if (item.type === 'ride') {
                                        return {
                                            name: item.subtype || 'ride',
                                            metrics: {
                                                durationSeconds: this.toSeconds(item.duration),
                                                power: item.power,
                                                ftpPct: item.ftpPct,
                                                rpe: item.intensity?.rpe,
                                            },
                                        };
                                    }
                                    return { name: item.type, metrics: {} };
                                }),
                                rest: (blk.items || []).find((i) => i && i.type === 'rest') ? {
                                    durationSeconds: this.toSeconds((blk.items || []).find((i) => i && i.type === 'rest')?.duration),
                                } : undefined,
                            };
                        }
                        if (act.type === 'intervals') {
                            const iv = act;
                            return {
                                type: 'set',
                                repeat: iv.repeats,
                                work: [{
                                        name: 'work',
                                        metrics: {
                                            durationSeconds: this.toSeconds(iv.work?.duration),
                                            power: iv.work?.power,
                                            ftpPct: iv.work?.ftpPct,
                                        },
                                    }],
                                rest: {
                                    durationSeconds: this.toSeconds(iv.rest?.duration),
                                },
                            };
                        }
                        if (act.type === 'ride' || act.type === 'rest') {
                            return {
                                type: 'continuous',
                                repeat: 1,
                                work: [{
                                        name: act.type,
                                        metrics: {
                                            durationSeconds: this.toSeconds(act.duration),
                                            power: act.power,
                                            ftpPct: act.ftpPct,
                                            rpe: act.intensity?.rpe,
                                        },
                                    }],
                            };
                        }
                        return {
                            type: 'continuous',
                            repeat: 1,
                            work: [{ name: act.type, metrics: {} }],
                        };
                    }),
                })),
            },
        };
        return training;
    }
}
exports.DTIRTransformer = DTIRTransformer;
exports.default = DTIRTransformer;

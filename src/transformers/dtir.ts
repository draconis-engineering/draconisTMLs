import { SwimSession } from '../types/dsml';
import { RunSession } from '../types/drml';
import { BikeSession } from '../types/dcml';
import { DTIRTraining } from '../types/dtir';

export class DTIRTransformer {
    toDTIR(session: SwimSession | RunSession | BikeSession): DTIRTraining {
        if ((session as SwimSession).type === 'swimsession') {
            return this.swimToDTIR(session as SwimSession);
        } else if ((session as RunSession).type === 'runsession') {
            return this.runToDTIR(session as RunSession);
        } else if ((session as BikeSession).type === 'bikesession') {
            return this.bikeToDTIR(session as BikeSession);
        }
        throw new Error('Unknown session type');
    }

    private swimToDTIR(session: SwimSession): DTIRTraining {
        const training: DTIRTraining = {
            id: session.metadata.id,
            metadata: {
                id: session.metadata.id,
                name: session.metadata.name,
                description: session.metadata.description,
                author: (session.metadata as any).author,
                created: (session.metadata as any).created,
                modified: (session.metadata as any).modified,
                athlete: session.metadata.athlete,
                coach: session.metadata.coach,
                date: session.metadata.date,
            },
            sport: 'swim',
            session: {
                phases: session.phases.map((phase, idx) => ({
                    name: phase.name,
                    order: idx,
                    blocks: phase.activities.map((act) => this.swimActivityToBlock(act)),
                })),
            },
        };
        return training;
    }

    private toSeconds(d: any): number | undefined {
        if (!d) return undefined;
        if (d.seconds !== undefined && d.seconds !== null)
            return Number(d.seconds);
        if (d.minutes !== undefined && d.minutes !== null)
            return Number(d.minutes) * 60;
        if (d.hours !== undefined && d.hours !== null)
            return Number(d.hours) * 3600;
        return undefined;
    }

    private swimActivityToStep(act: any): any {
        const metrics: any = {};
        const dur = this.toSeconds(act.duration);
        const dist = this.toMeters(act.distance);
        if (dist !== undefined) metrics.distanceMeters = dist;
        if (dur !== undefined) metrics.durationSeconds = dur;
        if (act.intensity?.rpe !== undefined) metrics.rpe = act.intensity.rpe;
        if (act.intensity?.percentEffort !== undefined) metrics.percentEffort = act.intensity.percentEffort;
        if (act.intensity?.zone !== undefined) metrics.zone = act.intensity.zone;
        if (act.targetPace) metrics.targetPace = act.targetPace;
        const step: any = { name: act.name || act.stroke || act.type, metrics };
        if (act.stroke) step.stroke = act.stroke;
        if (act.equipment && Object.keys(act.equipment).length) step.equipment = act.equipment;
        if (act.notes) step.notes = act.notes;
        return step;
    }

    private swimActivityToBlock(act: any): any {
        if (act.type === 'repeat') {
            const items = act.items || [];
            const restItem = items.find((i: any) => i.type === 'rest');
            const workItems = items.filter((i: any) => i.type !== 'rest');
            const block: any = {
                type: 'set',
                repeat: act.count || 1,
                work: workItems.flatMap((i: any) => this.swimActivityToWork(i)),
            };
            if (restItem) block.rest = { durationSeconds: this.toSeconds(restItem.duration) };
            return block;
        }
        if (act.type === 'drillset') {
            const items = act.items || [];
            return {
                type: 'continuous',
                repeat: 1,
                work: items.flatMap((i: any) => this.swimActivityToWork(i)),
            };
        }
        if (act.type === 'rest') {
            return { type: 'continuous', repeat: 1, work: [{ name: 'rest', metrics: { durationSeconds: this.toSeconds(act.duration) } }] };
        }
        return { type: 'continuous', repeat: 1, work: this.swimActivityToWork(act) };
    }

    private swimActivityToWork(act: any): any[] {
        if (!act) return [];
        if (act.type === 'drillset') return (act.items || []).flatMap((i: any) => this.swimActivityToWork(i));
        if (act.type === 'repeat') return [this.swimActivityToStep({ ...act, name: act.name || 'repeat' })];
        if (act.type === 'rest') return [{ name: 'rest', metrics: { durationSeconds: this.toSeconds(act.duration) } }];
        return [this.swimActivityToStep(act)];
    }

    private toMeters(dist: any): number | undefined {
        if (!dist) return undefined;
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

    private runToDTIR(session: RunSession): DTIRTraining {
        const training: DTIRTraining = {
            id: session.metadata.id,
            metadata: {
                id: session.metadata.id,
                name: session.metadata.name,
                description: session.metadata.description,
                author: (session.metadata as any).author,
                created: (session.metadata as any).created,
                modified: (session.metadata as any).modified,
                athlete: session.metadata.athlete,
                coach: session.metadata.coach,
                date: session.metadata.date,
            },
            sport: 'run',
            session: {
                phases: session.phases.map((phase, idx) => ({
                    name: phase.name,
                    order: idx,
                    blocks: phase.activities.map((act) => {
                        if (act.type === 'repeats') {
                            const rep: any = act as any;
                            return {
                                type: 'set',
                                repeat: rep.count,
                                work: (rep.items || [])
                                    .filter((i: any) => i && i.type !== 'rest')
                                    .map((item: any) => ({
                                        name: item.subtype || item.type,
                                        metrics: {
                                            distanceMeters: this.toMeters(
                                                item.distance,
                                            ),
                                            durationSeconds: this.toSeconds(
                                                item.duration,
                                            ),
                                            rpe: item.intensity?.rpe,
                                        },
                                    })),
                                rest: ((rep.items || []) as any[]).find(
                                    (i: any) => i && i.type === 'rest',
                                )
                                    ? {
                                          durationSeconds: this.toSeconds(
                                              ((rep.items || []) as any[]).find(
                                                  (i: any) =>
                                                      i && i.type === 'rest',
                                              )?.duration,
                                          ),
                                      }
                                    : undefined,
                            };
                        }
                        if (act.type === 'intervals') {
                            const iv: any = act as any;
                            return {
                                type: 'set',
                                repeat: iv.repeats,
                                work: [
                                    {
                                        name: iv.work?.subtype || 'work',
                                        metrics: {
                                            distanceMeters: this.toMeters(
                                                iv.work?.distance,
                                            ),
                                            durationSeconds: this.toSeconds(
                                                iv.work?.duration,
                                            ),
                                            rpe: iv.work?.intensity?.rpe,
                                        },
                                    },
                                ],
                                rest: {
                                    durationSeconds: this.toSeconds(
                                        iv.rest?.duration,
                                    ),
                                },
                            };
                        }
                        if (
                            act.type === 'run' ||
                            act.type === 'walk' ||
                            act.type === 'strides' ||
                            act.type === 'drills'
                        ) {
                            return {
                                type: 'continuous',
                                repeat: 1,
                                work: [
                                    {
                                        name: (act as any).subtype || act.type,
                                        metrics: {
                                            distanceMeters:
                                                this.toMeters(
                                                    (act as any).distance,
                                                ) ||
                                                (act as any).distanceMeters,
                                            durationSeconds: this.toSeconds(
                                                (act as any).duration,
                                            ),
                                            rpe: (act as any).intensity?.rpe,
                                        },
                                    },
                                ],
                            };
                        }
                        if (act.type === 'rest') {
                            return {
                                type: 'continuous',
                                repeat: 1,
                                work: [
                                    {
                                        name: 'rest',
                                        metrics: {
                                            durationSeconds: this.toSeconds(
                                                (act as any).duration,
                                            ),
                                        },
                                    },
                                ],
                            };
                        }
                        return {
                            type: 'continuous',
                            repeat: 1,
                            work: [{ name: (act as any).type, metrics: {} }],
                        };
                    }),
                })),
            },
        };
        return training;
    }

    private bikeToDTIR(session: BikeSession): DTIRTraining {
        const training: DTIRTraining = {
            id: session.metadata.id,
            metadata: {
                id: session.metadata.id,
                name: session.metadata.name,
                description: session.metadata.description,
                author: (session.metadata as any).author,
                created: (session.metadata as any).created,
                modified: (session.metadata as any).modified,
                athlete: session.metadata.athlete,
                coach: session.metadata.coach,
                date: session.metadata.date,
            },
            sport: 'bike',
            session: {
                phases: session.phases.map((phase, idx) => ({
                    name: phase.name,
                    order: idx,
                    blocks: phase.activities.map((act) => {
                        if (act.type === 'blocks') {
                            const blk: any = act as any;
                            // Flatten first level for simplicity
                            return {
                                type: 'set',
                                repeat: blk.repeats,
                                work: ((blk.items || []) as any[])
                                    .filter((i: any) => i && i.type !== 'rest')
                                    .map((item: any) => {
                                        if (item.type === 'intervals') {
                                            return {
                                                name: 'intervals',
                                                metrics: {
                                                    durationSeconds:
                                                        this.toSeconds(
                                                            item.work?.duration,
                                                        ),
                                                    power: item.work?.power,
                                                    ftpPct: item.work?.ftpPct,
                                                },
                                            };
                                        }
                                        if (item.type === 'ride') {
                                            return {
                                                name: item.subtype || 'ride',
                                                metrics: {
                                                    durationSeconds:
                                                        this.toSeconds(
                                                            item.duration,
                                                        ),
                                                    power: item.power,
                                                    ftpPct: item.ftpPct,
                                                    rpe: item.intensity?.rpe,
                                                },
                                            };
                                        }
                                        return { name: item.type, metrics: {} };
                                    }),
                                rest: ((blk.items || []) as any[]).find(
                                    (i: any) => i && i.type === 'rest',
                                )
                                    ? {
                                          durationSeconds: this.toSeconds(
                                              ((blk.items || []) as any[]).find(
                                                  (i: any) =>
                                                      i && i.type === 'rest',
                                              )?.duration,
                                          ),
                                      }
                                    : undefined,
                            };
                        }
                        if (act.type === 'intervals') {
                            const iv: any = act as any;
                            return {
                                type: 'set',
                                repeat: iv.repeats,
                                work: [
                                    {
                                        name: 'work',
                                        metrics: {
                                            durationSeconds: this.toSeconds(
                                                iv.work?.duration,
                                            ),
                                            power: iv.work?.power,
                                            ftpPct: iv.work?.ftpPct,
                                        },
                                    },
                                ],
                                rest: {
                                    durationSeconds: this.toSeconds(
                                        iv.rest?.duration,
                                    ),
                                },
                            };
                        }
                        if (act.type === 'ride' || act.type === 'rest') {
                            return {
                                type: 'continuous',
                                repeat: 1,
                                work: [
                                    {
                                        name: act.type,
                                        metrics: {
                                            durationSeconds: this.toSeconds(
                                                (act as any).duration,
                                            ),
                                            power: (act as any).power,
                                            ftpPct: (act as any).ftpPct,
                                            rpe: (act as any).intensity?.rpe,
                                        },
                                    },
                                ],
                            };
                        }
                        return {
                            type: 'continuous',
                            repeat: 1,
                            work: [{ name: (act as any).type, metrics: {} }],
                        };
                    }),
                })),
            },
        };
        return training;
    }
}

export default DTIRTransformer;

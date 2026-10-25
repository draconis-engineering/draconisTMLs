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
								work: act.items.filter(i => i.type === 'stroke' || i.type === 'drill').map((item: any) => ({
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
									durationSeconds: (act.items.find(i => i.type === 'rest') as any)?.duration?.seconds ||
										((act.items.find(i => i.type === 'rest') as any)?.duration?.minutes * 60)
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

	private runToDTIR(session: RunSession): DTIRTraining {
		const training: DTIRTraining = {
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
					blocks: [],
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
				athlete: session.metadata.athlete,
				coach: session.metadata.coach,
				date: session.metadata.date,
			},
			sport: 'bike',
			session: {
				phases: session.phases.map((phase, idx) => ({
					name: phase.name,
					order: idx,
					blocks: [],
				})),
			},
		};
		return training;
	}
}

export default DTIRTransformer;

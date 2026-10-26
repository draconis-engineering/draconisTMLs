import { SessionMetadata, Distance, Duration, Intensity } from './common';

export interface LocationConfig {
	type?: 'road' | 'trail' | 'track' | 'treadmill' | 'crosscountry';
	surface?: 'asphalt' | 'concrete' | 'gravel' | 'dirt' | 'grass' | 'track' | 'treadmill';
	elevation?: number;
}

export interface RunConfig {
	location?: LocationConfig;
	gear?: {
		shoes?: string;
		watch?: boolean;
	};
}

export interface RunRest {
	type: 'rest';
	duration: Duration;
	restType?: 'static' | 'walk' | 'jog';
}

export interface Run {
	type: 'run';
	subtype?: 'easy' | 'tempo' | 'threshold';
	distance?: Distance;
	duration?: Duration;
	intensity?: Intensity;
	notes?: string;
}

export interface Walk {
	type: 'walk';
	distance?: Distance;
	duration?: Duration;
}

export interface Strides {
	type: 'strides';
	count?: number;
	distanceMeters?: number;
	intensity?: Intensity;
}

export interface Drills {
	type: 'drills';
	name?: string;
	duration?: Duration;
	notes?: string;
}

export interface RunIntervals {
	type: 'intervals';
	repeats: number;
	work: Run;
	rest: RunRest;
}

export interface Repeats {
	type: 'repeats';
	count: number;
	items: (Run | RunIntervals | RunRest)[];
}

export type RunActivity = Run | Walk | Strides | Drills | RunIntervals | Repeats | RunRest;

export interface RunPhase {
	name: 'presession' | 'warmup' | 'main' | 'cooldown' | 'postsession';
	activities: RunActivity[];
}

export interface RunSession {
	type: 'runsession';
	metadata: SessionMetadata & { config?: RunConfig };
	config?: RunConfig;
	phases: RunPhase[];
}

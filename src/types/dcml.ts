import { SessionMetadata, Distance, Duration, Intensity } from './common';

export interface TrainerConfig {
	type?: 'smart' | 'wheel-on' | 'direct-drive' | 'fluid' | 'magnetic';
	resistanceMode?: 'erg' | 'sim' | 'level' | 'resistance';
}

export interface BikeConfig {
	ftp?: number;
	name?: string;
}

export interface BikeSessionConfig {
	trainer?: TrainerConfig;
	bike?: BikeConfig;
}

export interface CycleRest {
	type: 'rest';
	duration: Duration;
	power?: number;
	ftpPct?: number;
}

export interface Ride {
	type: 'ride';
	subtype?: 'warm' | 'easy' | 'steady' | 'threshold' | 'sweetspot' | 'vo2';
	distance?: Distance;
	duration?: Duration;
	power?: number;
	cadence?: number;
	ftpPct?: number;
	intensity?: Intensity;
	notes?: string;
}

export interface CycleIntervals {
	type: 'intervals';
	repeats: number;
	work: Ride;
	rest: CycleRest;
}

export interface Blocks {
	type: 'blocks';
	repeats: number;
	items: (Ride | CycleIntervals | CycleRest)[];
}

export type BikeActivity = Ride | CycleIntervals | Blocks | CycleRest;

export interface BikePhase {
	name: 'presession' | 'warmup' | 'main' | 'cooldown' | 'postsession';
	activities: BikeActivity[];
}

export interface BikeSession {
	type: 'bikesession';
	metadata: SessionMetadata & { config?: BikeSessionConfig };
	config?: BikeSessionConfig;
	phases: BikePhase[];
}

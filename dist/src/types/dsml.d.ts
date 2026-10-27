import { SessionMetadata, Distance, Duration, Intensity, Equipment } from './common';
export type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'medley' | 'drill';
export interface PoolConfig {
    lengthMeters?: number;
    lengthYards?: number;
    laneWidthMeters?: number;
    depthMeters?: number;
    indoor?: boolean;
}
export interface SwimGear extends Equipment {
}
export interface SwimConfig {
    pool?: PoolConfig;
    gear?: SwimGear;
}
export interface SwimRest {
    type: 'rest';
    duration: Duration;
    notes?: string;
}
export interface Drill {
    type: 'drill';
    name?: string;
    distance?: Distance;
    duration?: Duration;
    intensity?: Intensity;
    notes?: string;
}
export interface SwimStroke {
    type: 'stroke';
    stroke: Stroke;
    distance?: Distance;
    duration?: Duration;
    intensity?: Intensity;
    equipment?: Equipment;
    notes?: string;
}
export interface Repeat {
    type: 'repeat';
    count: number;
    items: (Drill | SwimStroke | SwimRest | Repeat)[];
}
export interface DrillSet {
    type: 'drillset';
    items: (Drill | SwimStroke | SwimRest)[];
}
export interface BandWork {
    type: 'bandwork';
    duration: Duration;
    intensity?: Intensity;
}
export interface Sauna {
    type: 'sauna';
    duration: Duration;
    temperatureCelsius?: number;
}
export type SwimActivity = SwimStroke | Drill | SwimRest | Repeat | DrillSet | BandWork | Sauna;
export interface SwimPhase {
    name: 'presession' | 'warmup' | 'main' | 'cooldown' | 'postsession';
    activities: SwimActivity[];
}
export interface SwimSession {
    type: 'swimsession';
    metadata: SessionMetadata & {
        config?: SwimConfig;
    };
    config?: SwimConfig;
    phases: SwimPhase[];
}

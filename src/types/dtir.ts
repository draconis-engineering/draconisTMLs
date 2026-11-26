import { SessionMetadata } from './common';

export interface DTIRMetadata extends SessionMetadata {
    author?: string;
    created?: string;
    modified?: string;
}

export interface DTIRMetrics {
    distanceMeters?: number;
    durationSeconds?: number;
    pacePer100m?: string;
    pacePerKm?: string;
    powerWatts?: number;
    power?: number;
    powerPctFTP?: number;
    ftpPct?: number;
    hrBpm?: number;
    hrPctMax?: number;
    rpe?: number;
    percentEffort?: number;
    zone?: number;
    cadence?: number;
    targetPace?: string;
}

export interface DTIREquipment {
    paddles?: boolean;
    fins?: boolean;
    snorkel?: boolean;
    pullbuoy?: boolean;
    kickboard?: boolean;
    bands?: boolean;
}

export interface DTIRWork {
    name?: string;
    stroke?: string;
    metrics: DTIRMetrics;
    equipment?: DTIREquipment;
    notes?: string;
}

export interface DTIRRest {
    durationSeconds?: number;
    type?: string;
}

export interface DTIRBlock {
    type?: 'continuous' | 'interval' | 'set' | 'drill';
    repeat: number;
    work: DTIRWork[];
    rest?: DTIRRest;
}

export interface DTIRPhase {
    name: string;
    order?: number;
    blocks: DTIRBlock[];
}

export interface DTIRSession {
    durationSeconds?: number;
    distanceMeters?: number;
    tss?: number;
    phases: DTIRPhase[];
}

export interface DTIRTraining {
    id: string;
    version?: string;
    metadata: DTIRMetadata;
    sport: 'swim' | 'run' | 'bike' | 'triathlon';
    session: DTIRSession;
}

import { SessionMetadata } from './common';

export interface DTIRMetrics {
  distanceMeters?: number;
  durationSeconds?: number;
  pacePer100m?: string;
  pacePerKm?: string;
  powerWatts?: number;
  powerPctFTP?: number;
  hrBpm?: number;
  hrPctMax?: number;
  rpe?: number;
  cadence?: number;
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
  metadata: SessionMetadata;
  sport: 'swim' | 'run' | 'bike' | 'triathlon';
  session: DTIRSession;
}

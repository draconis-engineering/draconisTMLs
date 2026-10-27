export interface SessionMetadata {
    id: string;
    name?: string;
    date?: string;
    description?: string;
    athlete?: string;
    coach?: string;
    notes?: string;
    version?: string;
}
export interface Distance {
    meters?: number;
    yards?: number;
    kilometers?: number;
    miles?: number;
}
export interface Duration {
    seconds?: number;
    minutes?: number;
    hours?: number;
}
export interface Intensity {
    rpe?: number;
    hr?: number;
    power?: number;
    ftpPct?: number;
    pace?: string;
}
export interface Equipment {
    paddles?: boolean;
    fins?: boolean;
    snorkel?: boolean;
    pullbuoy?: boolean;
    kickboard?: boolean;
    bands?: boolean;
}

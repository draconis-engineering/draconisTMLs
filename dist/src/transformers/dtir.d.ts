import { SwimSession } from '../types/dsml';
import { RunSession } from '../types/drml';
import { BikeSession } from '../types/dcml';
import { DTIRTraining } from '../types/dtir';
export declare class DTIRTransformer {
    toDTIR(session: SwimSession | RunSession | BikeSession): DTIRTraining;
    private swimToDTIR;
    private toSeconds;
    private toMeters;
    private runToDTIR;
    private bikeToDTIR;
}
export default DTIRTransformer;

import { SwimSession } from '../types/dsml';
export declare class DSMLWriter {
    write(session: SwimSession): string;
    writeFile(session: SwimSession, filePath: string): void;
}
export default DSMLWriter;

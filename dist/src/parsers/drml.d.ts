export declare class DRMLParser {
    private parser;
    constructor();
    parseFile(filePath: string): any;
    parse(xml: string): any;
    private toDuration;
    private toDistance;
    private toIntensity;
    private parseActivity;
    private parsePhase;
    private parseRepeats;
    private parseIntervals;
    private toRunSession;
}
export default DRMLParser;

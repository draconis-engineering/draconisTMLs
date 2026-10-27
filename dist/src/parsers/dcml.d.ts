export declare class DCMLParser {
    private parser;
    constructor();
    parseFile(filePath: string): any;
    parse(xml: string): any;
    private toDuration;
    private toDistance;
    private toIntensity;
    private parseActivity;
    private parsePhase;
    private parseBlocks;
    private parseIntervals;
    private toBikeSession;
}
export default DCMLParser;

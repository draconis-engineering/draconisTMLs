export declare class DSMLParser {
    private parser;
    constructor();
    parseFile(filePath: string): any;
    parse(xml: string): any;
    private toDuration;
    private toDistance;
    private toIntensity;
    private toEquipment;
    private parseActivity;
    private parsePhase;
    private parseRepeat;
    private parseDrillSet;
    private toSwimSession;
}
export default DSMLParser;

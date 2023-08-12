/**
 * The Drums class provides static properties for calling specific MIDI drums by name, rather than number.
 * 
 * For example:
 * ```
 * new Clip(4)
 *  .addNote([0, 2], 1, Drums.acousticBass, 80)
 *  .addNote([1, 3], 1, Drums.acousticSnare, 80)
 *  .addNote([0, 1, 2, 3], 1, Drums.closedHiHat, 60);
 * ```
 * 
 * @category Midi IO
 */
export default abstract class Drums {
    static get acousticBass() { return 35; }
    static get bass1() { return 36; }
    static get sideStick() { return 37; }
    static get acousticSnare() { return 38; }
    static get handClap() { return 39; }
    static get electricSnare() { return 40; }
    static get lowFloorTom() { return 41; }
    static get closedHiHat() { return 42; }
    static get highFloorTom() { return 43; }
    static get pedalHiHat() { return 44; }
    static get lowTom() { return 45; }
    static get openHiHat() { return 46; }
    static get lowMidTom() { return 47; }
    static get hiMidTom() { return 48; }
    static get crashCymbal1() { return 49; }
    static get highTom() { return 50; }
    static get rideCymbal1() { return 51; }
    static get chineseCymbal() { return 52; }
    static get rideBell() { return 53; }
    static get tambourine() { return 54; }
    static get splashCymbal() { return 55; }
    static get cowbell() { return 56; }
    static get crashCymbal2() { return 57; }
    static get vibraslap() { return 58; }
    static get rideCymbal2() { return 59; }
    static get hiBongo() { return 60; }
    static get lowBongo() { return 61; }
    static get muteHiConga() { return 62; }
    static get openHiConga() { return 63; }
    static get lowConga() { return 64; }
    static get highTimbale() { return 65; }
    static get lowTimbale() { return 66; }
    static get highAgogo() { return 67; }
    static get lowAgogo() { return 68; }
    static get cabasa() { return 69; }
    static get maracas() { return 70; }
    static get shortWhistle() { return 71; }
    static get longWhistle() { return 72; }
    static get shortGuiro() { return 73; }
    static get longGuiro() { return 74; }
    static get claves() { return 75; }
    static get hiWoodBlock() { return 76; }
    static get lowWoodBlock() { return 77; }
    static get muteCuica() { return 78; }
    static get openCuica() { return 79; }
    static get muteTriangle() { return 80; }
    static get openTriangle() { return 81; }
}
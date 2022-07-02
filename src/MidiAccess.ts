
/**
 * The MidiAccess class provides an interface for fetching MIDI ports which data can be sent to, or received from.
 * 
 * The recommended way to get a new instance of this class is through the asynchronous `request()` method.
 * 
 * Example:
 * ```
 * const midiAccess = MidiAccess.request();
 * console.log(midiAccess.getOutPortNames()); 
 * ```
 * 
 * @category Midi IO
 */
export default class MidiAccess {
    /** Calling this static method is the recommended way to get new instances of this class. It waits for the MIDI access request to be confirmed before returning a new MidiAccess instance. */
    public static async request(): Promise<MidiAccess> {
        const access = await navigator['requestMIDIAccess']();
        return new MidiAccess(access);
    }

    private _baseAccess: any;

    /** Please use the `MidiAccess.request()` method instead. */
    constructor(baseAccess: any) {
        this._baseAccess = baseAccess;
    }

    /**
     * This method searches through all MIDI out ports for a specific one by name, and returns the port object.
     * @param portName The name of the expected MIDI out port.
     * @returns 
     */
    public getOutPort(portName: string): any {
        let output = null;
        this._baseAccess.outputs.forEach(port => {
            if (port.name === portName)
                output = port;
        });
        return output;
    }

    /**
     * This method searches through all MIDI in ports for a specific one by name, and returns the port object.
     * @param portName The name of the expected MIDI in port.
     * @returns 
     */
    public getInPort(portName: string): any {
        let output = null;
        this._baseAccess.inputs.forEach(port => {
            if (port.name === portName)
                output = port;
        });
        return output;
    }

    /**
     * This method returns the names of all available MIDI out ports.
     * @returns 
     */
    public getOutPortNames(): string[] {
        const output = [];
        this._baseAccess.outputs.forEach(port => output.push(port.name));
        return output;
    }

    /**
     * This method returns the names of all available MIDI in ports.
     * @returns 
     */
    public getInPortNames(): string[] {
        const output = [];
        this._baseAccess.inputs.forEach(port => output.push(port.name));
        return output;
    }
}
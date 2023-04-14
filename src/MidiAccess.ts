'use strict';

import ShimiEvent, { ShimiEventData } from './ShimiEvent';


/**
 * The MidiAccessPortEventData class extends ShimiEventData. It contains a reference to the source MidiAccess that created the event data, as well as information about a port that has changed.
 * 
 * @category Midi IO
 */
export class MidiAccessPortEventData extends ShimiEventData<MidiAccess> {
    /** The port which has been added, removed, or changed in some way. */
    get port(): any { return this._port; }
    private _port: any;

    constructor(source: MidiAccess, port: any) {
        super(source);
        this._port = port;
    }
}


/**
 * The MidiAccessPortEvent class extends ShimiEvent, providing an object which can be subscribed to.
 * 
 * It distributes events which point back to the source MidiAccess, and a MidiAccessPortEventData object that contains the event information.
 * 
 * @Category Midi IO
 */
export class MidiAccessPortEvent extends ShimiEvent<MidiAccessPortEventData, MidiAccess> {
}


/**
 * The MidiAccess class provides an interface for fetching MIDI ports which data can be sent to, or received from.
 * 
 * The recommended way to get a new instance of this class is through the asynchronous `request()` method.
 * 
 * Example:
 * ```
 * const midiAccess = await MidiAccess.request();
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
        this._baseAccess.onstatechange = this._onBaseAccessStateChange;
    }

    private _onBaseAccessStateChange = (port) => {
        this.portChanged.trigger(new MidiAccessPortEventData(this, port));
    };

    /**
     * The portChanged event dispatches an event whenever a new port is added, or an existing port is removed/modified.
     */
    get portChanged(): MidiAccessPortEvent { return this._portChanged; }
    private _portChanged: MidiAccessPortEvent = new MidiAccessPortEvent();

    /** Disconnects the MidiAccess object from its baseAccess. This is called to free things up for garbage collection. The MidiAccess object is entirely useless after this method has been called on it. */
    public detach() {
        if (this._baseAccess) {
            this._baseAccess.onstatechange = undefined;
            this._baseAccess = null;
        }
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
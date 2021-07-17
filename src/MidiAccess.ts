export default class MidiAccess {
    public static async request(): Promise<MidiAccess> {
        const access = await navigator['requestMIDIAccess']();
        return new MidiAccess(access);
    }

    private _baseAccess: any;

    constructor(baseAccess: any) {
        this._baseAccess = baseAccess;
    }

    public getOutPort(portName: string): any {
        this._baseAccess.outputs.forEach(port => {
            if (port.name === portName)
                return port;
        });
    }

    public getInPort(portName: string): any {
        this._baseAccess.inputs.forEach(port => {
            if (port.name === portName)
                return port;
        });
    }

    public getOutPorts(): string[] {
        const output = [];
        this._baseAccess.outputs.forEach(port => output.push(port.name));
        return output;
    }

    public getInPorts(): string[] {
        const output = [];
        this._baseAccess.inputs.forEach(port => output.push(port.name));
        return output;
    }
}
'use strict';


export default class ClockUpdateSource {
    private _useWebWorker: boolean = true;
    get useWebWorker(): boolean { return this._useWebWorker; }

    private _msPerTick: number;
    get msPerTick(): number { return this._msPerTick; }

    private _callback: () => void;
    get callback(): (() => void) { return this._callback; }

    private _running: boolean = false;
    get running(): boolean { return this._running; }

    private _webWorker: Worker = null;
    private _timer: NodeJS.Timer = null;


    constructor(callback: () => void, msPerTick: number = 5) {
        if (!callback)
            throw new Error('ClockUpdateSource must take a callback function');
        this._msPerTick = msPerTick;
        this._callback = callback;
    }


    start(): boolean {
        if (this.running)
            return false;
        this._running = true;
        this._startRunning();
        return true;
    }

    stop(): boolean {
        if (!this.running)
            return false;
        this._running = false;
        this._stopRunning();
        return true;
    }


    private _startRunning(): void {
        if (this.useWebWorker) {
            try {
                this._startWebWorker();
            }
            catch (ex) {
                this._useWebWorker = false;
                this._startRunning();
            }
        }
        else
            this._setInterval();
    }

    private _startWebWorker(): void {
        const blob = new Blob([
            `
            let timeoutTime = ${this.msPerTick};
            
            function tick() {
                setTimeout(tick, timeoutTime);
                self.postMessage('tick');
            }
            tick();
            `
        ], { type: 'text/javascript'});
        const blobUrl = URL.createObjectURL(blob);
        const worker = new Worker(blobUrl);
        worker.onmessage = this.callback;
        this._webWorker = worker;
    }

    private _setInterval(): void {
        this._timer = setInterval(this.callback, this.msPerTick);
    }

    private _stopRunning(): void {
        if (!!this._timer)
            clearTimeout(this._timer);
        if (!!this._webWorker) {
            this._webWorker.terminate();
            this._webWorker.onmessage = null;
        }
    }
}
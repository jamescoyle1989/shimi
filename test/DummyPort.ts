export default class DummyPort {
    messages: Array<Array<number>> = [];

    send(message: Array<number>): void {
        this.messages.push(message);
    }
}
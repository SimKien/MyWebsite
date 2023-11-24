import { WebsocketHandler } from "chess/lib/constants/WebsocketConstants";

export class WebsocketCLient {
    connection!: WebSocket;
    handlers: WebsocketHandler[]
    messageBuffer: string[];

    constructor(endpoint: string) {
        this.messageBuffer = [];
        this.handlers = [];
        this.connect(endpoint);
    }

    connect(endpoint: string) {
        this.connection = new WebSocket(endpoint);
        this.connection.onerror = (error) => { console.log(error); setTimeout(() => this.reconnect(), 1000) };
        this.connection.onopen = () => {
            console.log("Websocket opened");
            this.drainBuffer();
        };
        this.connection.onmessage = ((message) => {
            this.handlers.forEach(handler => handler(message.data as string))
        });
        this.connection.onclose = () => {
            console.log("Websocket closed");
        };
    }

    reconnect() {
        this.connect(this.connection.url);
    }

    send(message: string | object) {
        let msg = message;
        if (typeof message === "object") msg = JSON.stringify(message);
        this.messageBuffer.push(msg as string);
        this.drainBuffer()
    }

    drainBuffer() {
        if (!this.isOpen()) {
            this.reconnect();
            return;
        }

        this.messageBuffer.forEach(message => this.connection.send(message));
        this.messageBuffer = [];
    }

    addHandler(handler: WebsocketHandler) {
        this.handlers.push(handler);
    }

    isOpen() {
        return this.connection.readyState === WebSocket.OPEN;
    }
}
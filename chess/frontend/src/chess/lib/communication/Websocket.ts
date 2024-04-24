import { WebsocketHandler, WebsocketTypes } from "chess/lib/constants/WebsocketConstants";
import { WebsocketMessage } from "chess/lib/constants/CommunicationConstants";

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
        let i: NodeJS.Timeout
        this.connection.onopen = () => {
            console.log("Websocket opened");
            this.drainBuffer();
            i = setInterval(() => {
                let ping: WebsocketMessage = {
                    message_type: WebsocketTypes.PING,
                    from: "",
                    to: "",
                    move_type: "",
                    promotion_piece: ""
                }
                this.send(JSON.stringify(ping))
            }, 10000);
        };
        this.connection.onerror = (error) => { console.log(error); clearInterval(i); setTimeout(() => this.reconnect(), 1000) };
        this.connection.onmessage = ((message) => {
            this.handlers.forEach(handler => handler(message.data as string))
        });
        this.connection.onclose = () => {
            clearInterval(i);
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
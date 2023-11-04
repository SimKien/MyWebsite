import { WebsocketHandler } from "pages/chess/lib/constants/WebsocketConstants";

export class WebsocketCLient {
    connection: WebSocket;
    handlers: WebsocketHandler[]

    constructor(endpoint: string) {
        this.connection = new WebSocket(endpoint);
        this.handlers = [];
        this.connection.onerror = (error) => { console.log(error) };
        this.connection.onopen = () => {
            console.log("Websocket opened");
        };
        this.connection.onmessage = ((message) => {
            this.handlers.forEach(handler => handler(message.data as string))
        });
        this.connection.onclose = () => {
            console.log("Websocket closed");
        };
    }

    send(message: string) {
        this.connection.send(message);
    }

    addHandler(handler: WebsocketHandler) {
        this.handlers.push(handler);
    }
}
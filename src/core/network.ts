import { io, Socket } from "socket.io-client"
import { PrismEvent, type EventCallback } from "./events/event";
import { EventHub } from "./events/event_hub";

const NETWORK_DELAYED_PACKAGE_DROP = 5000.0;
const EXCESSIVE_MESSAGE_QUEUE_SIZE = 100;

export enum NetworkStatus {
    waitingForInitialization,
    initialization,
    connectionError,
    connectionLost,
    connected,
    reconnecting,
    disconnected
}

/**
 * PrismEvent for network, uses unknown for data as information coming over the network is all different
 * adds a verb field as that is used by socket.io
 */
export class NetworkMessage extends PrismEvent<unknown> {
    readonly verb: string;

    constructor(verb: string, data: unknown) {
        super(data);
        this.verb = verb;   
    }
}

/**
 * Networking object for prism using socket.io
 * Works through the event system where all incoming packets are events
 * Has a _priorityMessageQueue which is always cleared out entirely before sending messages from _messageQueue
 */
export class Network {
    private _socket?: Socket;
    private _networkStatus: NetworkStatus = NetworkStatus.waitingForInitialization
    private _messageQueue: Array<NetworkMessage> = new Array<NetworkMessage>;
    private _priorityMessageQueue: Array<NetworkMessage> = new Array<NetworkMessage>;

    private readonly _netEventHub: EventHub = new EventHub();

    get networkStatus(): NetworkStatus {
        return this._networkStatus;
    }

    /**
     * Configures the socket, and starts the connection
     * @param serverAddr address of server we are connecting to
     */
    start(serverAddr: string){
        if (this.networkStatus != NetworkStatus.waitingForInitialization)
            console.log('Network already initialized');

        this._networkStatus = NetworkStatus.initialization;
        
        this._socket = io(serverAddr, {autoConnect: false});

        this._socket.on('connect', () => {
            this._networkStatus = NetworkStatus.connected;
            console.log(`Connected to server: ${serverAddr}`);
        });

        this._socket.on('connect_error', (err) => {
            this._networkStatus = NetworkStatus.connectionError;
            console.log(`Connection error`);
            console.log(err);
        });

        this._socket.on('disconnect', (msg) => {
            this._networkStatus = NetworkStatus.disconnected;
            console.log(`Disconnected from server`);
            console.log(msg);
        });

        this._socket.on('reconnecting', (msg) => {
            this._networkStatus = NetworkStatus.reconnecting;
            console.log(`Reconnecting to server`);
            console.log(msg);
        });

        this._socket.onAny((event : string, data) => {
            this._netEventHub.advertise(event).publish(new NetworkMessage(event, data));
        });
        
        this._socket.connect();
    }

    /**
     * returns the network object back to a uninitialized state
     */
    stop() {
        this._socket?.close();
        this._networkStatus = NetworkStatus.waitingForInitialization;
        this._messageQueue = new Array<NetworkMessage>;
        this._priorityMessageQueue = new Array<NetworkMessage>
    }

    /**
     * checks if the network is healthy and if so emits a message over the socket
     * messages in _priorityMessageQueue must be entirely cleared out before _messageQueue is used
     * @param delta time in ms since last call to update, use to determine health of the network
     */
    update(delta: number): void {
        if (this.networkStatus != NetworkStatus.connected)
            return;

        if (this._messageQueue.length == 0 && this._priorityMessageQueue.length == 0)
            return;

        if (delta > NETWORK_DELAYED_PACKAGE_DROP) {
            console.log(`Network update too slow, dropping messages. Current delta: ${delta} `);
            this._messageQueue = new Array<NetworkMessage>;
            this._priorityMessageQueue = new Array<NetworkMessage>;
            return
        }

        if (this._messageQueue.length + this._priorityMessageQueue.length > EXCESSIVE_MESSAGE_QUEUE_SIZE) {
            console.log(`Excessive message queue size, dropping messages. Current delta: ${delta} `);
            this._messageQueue = new Array<NetworkMessage>;
            this._priorityMessageQueue = new Array<NetworkMessage>;
            return;
        }

        if (this._priorityMessageQueue.length > 0) {
            const msg: NetworkMessage = this._priorityMessageQueue.shift()!;
            this._socket?.emit(msg.verb, msg.data);
            return;
        }

        if (this._messageQueue.length > 0) {
            const msg: NetworkMessage = this._messageQueue.shift()!;
            this._socket?.emit(msg.verb, msg.data);
            return;
        }
    }

    /**
     * Sends a message out over the network
     * @param msg Message to send
     * @param priority put the message in the priority queue
     * @param immediate send the message out immediately
     * @returns false network is not connected, true otherwise
     */
    publishNet (msg: NetworkMessage, priority: boolean = false, immediate: boolean = false): boolean {
        if (this.networkStatus != NetworkStatus.connected) {
            console.log("Network not connected, message dropped.");
            return false;
        }

        if (immediate) {
            this._socket?.emit(msg.verb, msg.data);
            return true;
        }

        if (priority) {
            this._priorityMessageQueue.push(msg);
            return true;
        }

        this._messageQueue.push(msg);
        return true;
    }

    /**
     * Takes a topic name (the message type from the server) an maps it to a callback
     * works just like normal events, but listens to packets coming from the network
     * @param topicName topic to subscribe to
     * @param callback callback for the event
     * @returns a Subscriber object for the subscription
     */
    subscribeNet<TEvent extends PrismEvent<unknown>> (topicName: string, callback: EventCallback<unknown>) {
        return this._netEventHub.subscribe<TEvent>(topicName, callback);
    }

    /**
     * compatibility layer might remove later
     */
    sendMessage(verb: string, data: unknown) {
        const msg = new NetworkMessage(verb, data);
        this.publishNet(msg);
    }
}
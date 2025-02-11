import { readConfigFile } from "typescript";
import { type EventCallback } from "./event";

/**
 * Creates a publisher and subscribers and stores a list of current topics
 * This is the only class in the event system that should be manually created, the rest are created through the event hub
 * TODO?: Should this have a topic delete function?
 */
export class EventHub {
    private _topics: Array<Topic<any>> = new Array<Topic<any>>;

    /**
     * @returns readonly ref to private field _topics
     */
    get topics(): ReadonlyArray<Topic<any>> {
        return this._topics;
    }

    /**
     * returns the publisher to the topicName. Creates a new topic if it doesn't already exist
     * @template TEvent the event type used, must extend PrismEvent
     * @param topicName the name of the topic to get a publisher to
     * @returns the publisher for the topic
     */
    advertise<TEvent>(topicName: string): Publisher<TEvent> {
        /* check if topic exists */
        for (let topicKey in this._topics) {
            let topic = this._topics[topicKey];
            if (topic.name == topicName) {
                return topic.publisher;
            }
        }

        /* create new topic if needed */
        let newTopic = new Topic<TEvent>(topicName);
        this._topics.push(newTopic);
        return newTopic.publisher;
    }

    /**
     * returns a subscriber to the topicName with the callback. creates a new topic if it doesn't already exist
     * @template TEvent the event type used, must extend PrismEvent
     * @param topicName the name of the topic to create a subscriber
     * @param callback callback to set for the topic
     * @returns a subscriber for the topic
     */
    subscribe<TEvent>(topicName: string, callback: EventCallback<TEvent>): Subscriber<TEvent> {
        /* check if topic exists */
        for (let topicKey in this._topics) {
            let topic = this._topics[topicKey];
            if (topicName == topic.name) {
                let newSubscriber = new Subscriber<TEvent>(topic, callback);
                topic.addSubscriber(newSubscriber);
                return newSubscriber;
            }
        } 

        /* create new topic if needed */
        let newTopic = new Topic<TEvent>(topicName);
        this._topics.push(newTopic);
        let newSubscriber = new Subscriber<TEvent>(newTopic, callback);
        newTopic.addSubscriber(newSubscriber);
        return newSubscriber;
    }
}

/**
 * Holds a single publish for a topic and its list of subscribers
 * There should generally be no need to ever instantiate a topic directly
 * @template TEvent the event type used, must extend PrismEvent
 */
export class Topic<TEvent> {
    readonly name: string;
    readonly publisher: Publisher<TEvent> = new Publisher<TEvent>(this);
    private _subscribers: Array<Subscriber<TEvent>> = new Array<Subscriber<TEvent>>; // Should this be a map for easier removes?

    /**
     * @param name name of the topic this is used as its key for publishing events
     */
    constructor(name: string) {
        this.name = name;
    }

    /**
     * @returns readonly ref of private field _subscribers
     */
    get subscribers(): ReadonlyArray<Subscriber<TEvent>> {
        return this._subscribers;
    }

    /**
     * adds a subscriber to the array of subscribers
     * @param subscriber to be added
     */
    addSubscriber(subscriber: Subscriber<TEvent>) {
        this._subscribers.push(subscriber);
    }

    removeSubscriber(subscriber: Subscriber<TEvent>) {
        this._subscribers = this._subscribers.filter(sub => {sub !== subscriber});
    }
}

/**
 * Used to publish (emit) an event through a topic
 * There should generally be no need to ever instantiate a topic directly
 * @template TEvent the event type used, must extend PrismEvent
 */
export class Publisher<TEvent> {
    readonly topic: Topic<TEvent>

    /**
     * @param topic topic for the publisher
     */
    constructor(topic: Topic<TEvent>) {
        this.topic = topic;
    }

    /**
     * Publishes (emits) and event of its topic
     * @param data the event data
     */
    publish(data: TEvent): void {
        for (let subscriberKey in this.topic.subscribers) {
            this.topic.subscribers[subscriberKey].callback(data);
        }
    }
}

/**
 * holds the callback for a subscription and its topic
 * There should generally be no need to ever instantiate a topic directly
 * @template TEvent the event type used, must extend PrismEvent
 * TODO: unsubscribe function
 */
export class Subscriber<Event> {
    readonly topic: Topic<Event>;
    readonly callback: EventCallback<Event>;
     
    /**
     * @param topic the topic for this subscription
     * @param callback the callback to use
     */
    constructor(topic: Topic<Event>, callback: EventCallback<Event>) {
        this.topic = topic;
        this.callback = callback;
    }

    unsubscribe(): void {
        this.topic.removeSubscriber(this);
    }
}

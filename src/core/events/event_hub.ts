import { PrismEvent, type EventCallback } from './event';

/**
 * Creates a publisher and subscribers and stores a list of current topics
 * This is the only class in the event system that should be manually created, the rest are created through the event hub
 * TODO?: Should this have a topic delete function?
 */
export class EventHub {
  private _topics: Array<Topic<PrismEvent<unknown>>> = [];

  /**
   * @returns readonly ref to private field _topics
   */
  get topics(): ReadonlyArray<Topic<PrismEvent<unknown>>> {
    return this._topics;
  }

  /**
   * returns the publisher to the topicName. Creates a new topic if it doesn't already exist
   * @template TEvent the event type used, must extend PrismEvent
   * @param topicName the name of the topic to get a publisher to
   * @returns the publisher for the topic
   */
  advertise<TEvent extends PrismEvent<unknown>>(topicName: string): Publisher<TEvent> {
    /* check if topic exists */
    let publisher: Publisher<TEvent> | null = null;
    this._topics.forEach((topic: Topic<TEvent>) => {
      if (topic.name == topicName) {
        publisher = topic.publisher;
        return; // Equivalent to break
      }
    });

    if (publisher !== null) {
      return publisher;
    } else {
      /* create new topic */
      const newTopic = new Topic<PrismEvent<unknown>>(topicName); // We do not utilize the type here to support this._topics having an unknown event type.
      this._topics.push(newTopic);
      return newTopic.publisher;
    }
  }

  /**
   * returns a subscriber to the topicName with the callback. creates a new topic if it doesn't already exist
   * @template TEvent the event type used, must extend PrismEvent
   * @param topicName the name of the topic to create a subscriber
   * @param callback callback to set for the topic
   * @returns a subscriber for the topic
   */
  subscribe<TEvent extends PrismEvent<unknown>>(topicName: string, callback: EventCallback<unknown>): Subscriber<TEvent> {
    /* check if topic exists */
    let subscriber: Subscriber<TEvent> | null = null;
    this._topics.forEach((topic: Topic<TEvent>) => {
      if (topic.name == topicName) {
        subscriber = new Subscriber<TEvent>(topic, callback);
        topic.addSubscriber(subscriber);
        return; // Equivalent to break;
      }
    });

    if (subscriber === null) {
      /* create new topic if needed */
      const newTopic = new Topic<TEvent>(topicName);
      this._topics.push(newTopic as Topic<PrismEvent<unknown>>);
      subscriber = new Subscriber<TEvent>(newTopic, callback);
      newTopic.addSubscriber(subscriber);
    }

    return subscriber;
  }
}

/**
 * Holds a single publish for a topic and its list of subscribers
 * There should generally be no need to ever instantiate a topic directly
 * @template TEvent the event type used, must extend PrismEvent
 */
export class Topic<TEvent extends PrismEvent<unknown>> {
  readonly name: string;
  readonly publisher: Publisher<TEvent> = new Publisher<TEvent>(this);
  private _subscribers: Array<Subscriber<TEvent>> = new Array<Subscriber<TEvent>>();

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
}

/**
 * Used to publish (emit) an event through a topic
 * There should generally be no need to ever instantiate a topic directly
 * @template TEvent the event type used, must extend PrismEvent
 */
export class Publisher<TEvent extends PrismEvent<unknown>> {
  readonly topic: Topic<TEvent>;

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
  publish(data: unknown): void {
    this.topic.subscribers.forEach((subscriber: Subscriber<TEvent>) => {
      subscriber.callback(data);
    });
  }
}

/**
 * holds the callback for a subscription and its topic
 * There should generally be no need to ever instantiate a topic directly
 * @template TEvent the event type used, must extend PrismEvent
 * TODO: unsubscribe function
 */
export class Subscriber<TEvent extends PrismEvent<unknown>> {
  readonly topic: Topic<TEvent>;
  readonly callback: EventCallback<unknown>;

  /**
   * @param topic the topic for this subscription
   * @param callback the callback to use
   */
  constructor(topic: Topic<TEvent>, callback: EventCallback<unknown>) {
    this.topic = topic;
    this.callback = callback;
  }
}

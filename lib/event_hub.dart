abstract class Event<TEventData> {
  final DateTime timestamp = DateTime.now();
  abstract TEventData data;
}

class EventHub {
  List<Topic> topics;
  EventHub() : topics = [];

  Publisher<TEventType> advertise<TEventType extends Event>(String topicName) {
    // Check if Topic already exists, if so return existing publisher
    for (Topic topic in topics) {
      if (topic.name == topicName && topic is Topic<TEventType>) {
        return topic.publisher;
      }
    }

    // Topic doesn't exist, create new publisher and topic
    Topic<TEventType> newTopic = Topic<TEventType>(topicName);
    topics.add(newTopic);
    return newTopic.publisher;
  }

  Subscriber<TEventType> subscribe<TEventType extends Event>(
      String topicName, void Function(TEventType) callback) {
    for (Topic topic in topics) {
      if (topic.name == topicName) {
        Subscriber<TEventType> newSubscriber =
            Subscriber<TEventType>(topic, callback);
        topic.subscribers.add(newSubscriber);
        return newSubscriber;
      }
    }

    // Topic doesn't exist, create new subscriber and topic
    Topic newTopic = Topic<TEventType>(topicName);
    Subscriber<TEventType> newSubscriber =
        Subscriber<TEventType>(newTopic, callback);
    newTopic.subscribers.add(newSubscriber);
    return newSubscriber;
  }
}

base class Topic<TEventType> {
  final String _name;
  late Publisher<TEventType> _publisher;
  final List<Subscriber<TEventType>> _subscribers;

  Topic(this._name) : _subscribers = [] {
    _publisher = Publisher<TEventType>(this);
  }

  List<Subscriber<TEventType>> get subscribers {
    return _subscribers;
  }

  get name {
    return _name;
  }

  Publisher<TEventType> get publisher {
    return _publisher;
  }
}

class Publisher<TEventType> {
  final Topic<TEventType> topic;
  Publisher(this.topic);

  void publish(TEventType data) {
    for (Subscriber<TEventType> subscriber in topic.subscribers) {
      subscriber.callback(data);
    }
  }
}

class Subscriber<TEventType> {
  final Topic topic;
  final void Function(TEventType) callback;

  Subscriber(this.topic, this.callback);
}

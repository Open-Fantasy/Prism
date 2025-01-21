import 'package:prism/event_hub.dart' show Event;

class EngineTickEventData {
  double delta = 0.0;
}

class EngineTickEvent extends Event<EngineTickEventData> {
  @override
  late EngineTickEventData data;
}

class TestEventData {
  String testData;
  TestEventData() : testData = "";
  TestEventData.from(this.testData);
}

class TestEvent extends Event<TestEventData> {
  @override
  TestEventData data;

  TestEvent() : data = TestEventData();
  TestEvent.from(this.data);
}

class AnotherEvent extends Event<TestEventData> {
  @override
  TestEventData data;

  AnotherEvent() : data = TestEventData();
  AnotherEvent.from(this.data);
}

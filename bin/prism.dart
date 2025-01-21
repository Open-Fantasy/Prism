import 'package:prism/events.dart' as events;
import 'package:prism/event_hub.dart' show EventHub;

void main(List<String> arguments) {
  var eventManager = EventHub();
  var engineTickPub = eventManager.advertise("EngineTick");
  var engineTickSub = eventManager.subscribe("EngineTick", (dynamic event) {
      print(event.toString());
  });

  engineTickPub.publish(events.TestEvent());
  engineTickPub.publish(events.EngineTickEvent());
}
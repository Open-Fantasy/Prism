import 'package:prism_engine/events.dart' as events;
import 'package:prism_engine/event_hub.dart' show EventHub;

void main(List<String> arguments) {
  var eventManager = EventHub();
  var engineTickPub = eventManager.advertise("EngineTick");
  var engineTickSub = eventManager.subscribe("EngineTick", (dynamic event) {
    print(event.toString());
  });

  engineTickPub.publish(events.TestEvent());
  engineTickPub.publish(events.EngineTickEvent());
}

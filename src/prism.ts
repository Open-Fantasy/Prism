import { EventHub, Topic } from "./events/event_hub";


let eventHub = new EventHub();
let pub = eventHub.advertise("testTopic");
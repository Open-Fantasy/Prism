import {describe, it, expect, beforeEach } from "bun:test";
import { EventHub } from "prism-engine";

let eventHub: EventHub;
let topicName = "newTopic"

beforeEach(() => {
    eventHub = new EventHub();
});

describe("EventHub Tests", () => {
    it("advertise creates a new topic and adds to topics array", () => {
        expect(eventHub.topics.length).toBe(0);
        eventHub.advertise(topicName);
        expect(eventHub.topics.length).toBe(1);
        let topic = eventHub.topics[0];
        expect(topic.name).toBe(topicName);
    });

    it("advertise to same topic returns same publisher", () => {
        let publisherA = eventHub.advertise(topicName);
        let publisherB = eventHub.advertise(topicName);
        expect(eventHub.topics.length).toBe(1);
        expect(publisherA).toBe(publisherB);
    });

    it("subscribe creates a new topic and adds to topics array", () => {
        expect(eventHub.topics.length).toBe(0);
        eventHub.subscribe(topicName, (_) => {});
        expect(eventHub.topics.length).toBe(1);
        let topic = eventHub.topics[0];
        expect(topic.name).toBe(topicName);
    });

    it("subscribe twice creates a second subscriber", () => {
        let subscriberA = eventHub.subscribe(topicName, (_) => {});
        let subscriberB = eventHub.subscribe(topicName, (_) => {});
        expect(eventHub.topics[0].subscribers.length).toBe(2);
        expect(subscriberA).not.toBe(subscriberB);
    });

    it("subscribe twice to the same topic does not create a new topic", () => {
        eventHub.subscribe(topicName, (_) => {});
        eventHub.subscribe(topicName, (_) => {});
        expect(eventHub.topics.length).toBe(1);
    })

    it("multiple topics can be made though advertise", () => {
        let topicNameA = "topicNameA";
        let topicNameB = "topicNameB";
        eventHub.advertise(topicNameA);
        eventHub.advertise(topicNameB);
        expect(eventHub.topics.length).toBe(2);
    });

    it("multiple topics can be made though subscribe", () => {
        let topicNameA = "topicNameA";
        let topicNameB = "topicNameB";
        eventHub.subscribe(topicNameA, (_)=> {});
        eventHub.subscribe(topicNameB, (_)=> {});
        expect(eventHub.topics.length).toBe(2);
    });
})
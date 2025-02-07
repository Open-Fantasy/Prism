import {describe, it, expect, beforeEach } from "bun:test";
import { EventHub, Publisher } from "../../src/events/event_hub";
import { PrismEvent } from "../../src/events/event";

type TestType = {x: number;};
type TestEventType = PrismEvent<TestType>;

let eventHub: EventHub;
let publisher: Publisher<TestEventType>;
let topicName = "newTopic"

let testData: {x: number};
let testArr: Array<TestEventType>;

function testCallback(data: TestEventType) {
    testArr.push(data);
}

class TestEvent extends PrismEvent<{x: number}> {
    constructor(data: {x: number}) {
        super(data);
    }

    override get data(): {x: number} {
        return super.data as {x: number};
    }

}

beforeEach(() => {
    eventHub = new EventHub();
    publisher = eventHub.advertise(topicName);
    testData = {x: 42};
    testArr = new Array<TestEventType>;
});

describe("Publisher Tests", () => {
    it("publisher does nothing with no subscribers", () => {
        let data = new TestEvent({x: 1});
        publisher.publish(data);
        expect(testArr.length).toBe(0);
    });

    it("publisher works with one subscriber", () => {
        eventHub.subscribe(topicName, testCallback);
        let data = new TestEvent(testData);
        publisher.publish(data);
        expect(testArr.length).toBe(1);
        expect(testArr[0].data).toBe(testData);
    });

    it("publisher works with two subscribers", () => {
        eventHub.subscribe(topicName, testCallback);
        eventHub.subscribe(topicName, testCallback);
        let dataA = new TestEvent(testData);
        publisher.publish(dataA);
        expect(testArr.length).toBe(2);
        expect(testArr[0].data).toBe(testData);
        expect(testArr[1].data).toBe(testData);
    });

    it("publisher works with two subscribers and two publishes", () => {
        eventHub.subscribe(topicName, testCallback);
        eventHub.subscribe(topicName, testCallback);
        let dataA = new TestEvent(testData);
        let testDataB = {x: 2};
        let dataB = new TestEvent(testDataB);
        publisher.publish(dataA);
        publisher.publish(dataB);
        expect(testArr.length).toBe(4);
        expect(testArr[0].data).toBe(testData);
        expect(testArr[1].data).toBe(testData);
        expect(testArr[2].data).toBe(testDataB);
        expect(testArr[3].data).toBe(testDataB);
    });
})
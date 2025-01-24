import { describe, expect, it, test } from "bun:test";
import { PrismEvent } from "../../src/events/event";

class TestEvent extends PrismEvent<{x: {y: number}}>{};

describe("Event Test", () => {
    it("Event Data is correctly deep freezed", () => {
        let testEvent = new TestEvent({x: {y: 1}});
        expect(() => { testEvent.data.x = {y: 2} }).toThrow(TypeError);
        expect(() => { testEvent.data.x.y = 3 }).toThrow(TypeError);
    });
})
import { deepFreeze } from "../../utils/deepFreeze";

/**
 * GameEvents are used by the event system
 * This should be extended to a more specific event type: See ExampleEvent below
 */
export abstract class PrismEvent<T> {
    readonly timestamp: number = Date.now();
    private readonly _data: unknown;

    constructor(data: T) {
        this._data = deepFreeze(data as Object);
    }

    get data(): T {
        return this._data as T;
    }
}

/**
 * example class that extends PrismEvent with a specific data type
 */
export class ExampleEvent extends PrismEvent<{x: number}> {};

/**
 * callback signature for events
 * they take a GameEvent and return nothing
 */
export type EventCallback<T> = (data: T) => void;

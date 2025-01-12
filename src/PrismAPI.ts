import EventManagerAPI from "./api/EventManagerAPI.ts";
import NetworkAPI from "./api/NetworkAPI.ts";
import StateManagerAPI from "./api/StateManagerAPI.ts";

interface PrismAPI {
    Events: EventManagerAPI;
    Network: NetworkAPI;
    States: StateManagerAPI;
}

const PrismAPI : PrismAPI = { Events: new EventManagerAPI(), Network: new NetworkAPI(), States: new StateManagerAPI()}
export default PrismAPI;
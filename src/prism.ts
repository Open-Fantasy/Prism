import { sleep } from "bun";
import { Network, NetworkMessage } from "./network";

let network = new Network();
let sub = network.subscribeNet<NetworkMessage>("message", (data) => {console.log(data)});
let msg = new NetworkMessage("message", "testData");


network.start("http://localhost:42069");
await sleep(1000);
network.publishNet(msg, false, false);
network.update(0);
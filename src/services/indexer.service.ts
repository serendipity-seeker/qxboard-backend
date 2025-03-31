import logger from "../config/logger";
import fs from "fs";
import path from "path";
import { fetchTickInfo, fetchTickEvents } from "./rpc.service";

const readState = async () => {
  const filePath = path.join(__dirname, "state.json");
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ processedTick: 0 }));
  }
  const state = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return state.processedTick;
};

const writeState = async (state: any) => {
  const filePath = path.join(__dirname, "state.json");
  fs.writeFileSync(filePath, JSON.stringify(state));
};

const indexer = async () => {
  let processedTick = await readState();
  if (!processedTick) {
    processedTick = (await fetchTickInfo()).tick;
  }

  console.log(`Last processed tick: ${processedTick}`);

  let tick = processedTick;
  setInterval(async () => {
    const tickInfo = await fetchTickInfo();
    if (tickInfo.tick > tick) {
      const tickEvents = await fetchTickEvents(tick);
      console.log(tickEvents);
      tick++;
    }
  }, 1000);
};

indexer();

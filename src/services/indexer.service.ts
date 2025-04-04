import fs from "fs";
import path from "path";
import { fetchTickEvents, fetchLatestTick } from "./rpc.service";
import { decodeQXLog } from "./log.service";
import prisma from "../client";
import tradeService from "../domains/trade/trade.service";
import cron from "node-cron";
import logger from "../config/logger";

interface IndexerState {
  processedTick: number;
}

let cronJob: cron.ScheduledTask | null = null;
let running = false;
let currentTick = 0;
const stateFilePath = path.join(__dirname, "state.log");
const cronSchedule = "*/1 * * * *"; // Run every minute by default

async function readState(): Promise<number> {
  try {
    if (!fs.existsSync(stateFilePath)) {
      fs.writeFileSync(stateFilePath, JSON.stringify({ processedTick: 0 }));
    }
    const state = JSON.parse(fs.readFileSync(stateFilePath, "utf8"));
    return state.processedTick;
  } catch (error) {
    logger.error(`Error reading state: ${error}`);
    return 0;
  }
}

async function writeState(state: IndexerState): Promise<void> {
  try {
    fs.writeFileSync(stateFilePath, JSON.stringify(state));
  } catch (error) {
    logger.error(`Error writing state: ${error}`);
  }
}

export async function getState(): Promise<IndexerState> {
  const processedTick = await readState();
  return { processedTick };
}

export async function setState(state: IndexerState): Promise<void> {
  await writeState(state);
  currentTick = state.processedTick;
}

export async function runIndexer(): Promise<void> {
  if (!running) return;

  try {
    const latestTick = await fetchLatestTick();

    if (latestTick <= currentTick) {
      logger.debug("No new ticks to process");
      return; // Nothing new to process
    }

    logger.info(`Processing ticks from ${currentTick} to ${latestTick}`);

    while (currentTick < latestTick && running) {
      try {
        const tickEvents = await fetchTickEvents(currentTick);
        const qxLogs = await decodeQXLog(tickEvents);
        logger.info(`Processing ${qxLogs.length} logs for tick ${currentTick}`);

        await Promise.all(
          qxLogs.map(async (log) => {
            try {
              let asset = await prisma.asset.findUnique({
                where: {
                  name_issuer: {
                    name: log.assetName,
                    issuer: log.issuer
                  }
                }
              });

              if (!asset) {
                asset = await prisma.asset.create({
                  data: {
                    name: log.assetName,
                    issuer: log.issuer
                  }
                });
              }

              const trade = await tradeService.createTrade({
                assetID: asset.id,
                maker: log.maker,
                taker: log.taker,
                price: log.price,
                amount: log.amount,
                tick: log.tick,
                txHash: log.txHash
              });

              logger.debug(`Created trade for ${log.assetName} at tick ${log.tick}`);
            } catch (error) {
              logger.error(error);
            }
          })
        );

        currentTick++;
        await writeState({ processedTick: currentTick });
      } catch (error) {
        logger.error(`Error processing tick ${currentTick}: ${error}`);
        break;
      }
    }

    logger.info(`Indexer job completed. Current tick: ${currentTick}`);
  } catch (error) {
    logger.error(`Error in indexer job: ${error}`);
  }
}

export async function start(): Promise<void> {
  if (running) {
    logger.info("Indexer already running");
    return;
  }

  try {
    running = true;
    currentTick = await readState();

    if (!currentTick) {
      try {
        currentTick = await fetchLatestTick();
        logger.info(`Starting from latest tick: ${currentTick}`);
      } catch (error) {
        logger.error(`Error fetching latest tick: ${error}`);
        currentTick = 0;
      }
    }

    logger.info(`Indexer started. Last processed tick: ${currentTick}`);

    // Schedule the cron job
    cronJob = cron.schedule(cronSchedule, async () => {
      try {
        logger.info("Running scheduled indexer job");
        await runIndexer();
      } catch (error) {
        logger.error(`Error in scheduled indexer job: ${error}`);
      }
    });

    runIndexer();
  } catch (error) {
    logger.error(`Fatal error in indexer: ${error}`);
    running = false;
    // Restart the indexer after a delay
    setTimeout(() => {
      logger.info("Restarting indexer after error...");
      start();
    }, 5000);
  }
}

export function stop(): void {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
  }
  running = false;
  logger.info("Indexer stopped");
}

export const indexer = {
  start,
  stop,
  getState,
  setState,
  runIndexer
};

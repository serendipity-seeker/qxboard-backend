import fs from "fs";
import path from "path";
import { fetchTickEvents, fetchLatestTick } from "./rpc.service";
import { decodeQXLog } from "./log.service";

interface IndexerState {
  processedTick: number;
}

interface Indexer {
  start(): Promise<void>;
  stop(): void;
  getState(): Promise<IndexerState>;
  setState(state: IndexerState): Promise<void>;
}

class QXIndexer implements Indexer {
  private intervalId: NodeJS.Timeout | null = null;
  private running: boolean = false;
  private currentTick: number = 0;

  private async readState(): Promise<number> {
    try {
      const filePath = path.join(__dirname, "state.json");
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({ processedTick: 0 }));
      }
      const state = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return state.processedTick;
    } catch (error) {
      console.error(`Error reading state: ${error}`);
      return 0;
    }
  }

  private async writeState(state: IndexerState): Promise<void> {
    try {
      const filePath = path.join(__dirname, "state.json");
      fs.writeFileSync(filePath, JSON.stringify(state));
    } catch (error) {
      console.error(`Error writing state: ${error}`);
    }
  }

  async getState(): Promise<IndexerState> {
    const processedTick = await this.readState();
    return { processedTick };
  }

  async setState(state: IndexerState): Promise<void> {
    await this.writeState(state);
    this.currentTick = state.processedTick;
  }

  async start(): Promise<void> {
    if (this.running) return;

    try {
      this.running = true;
      this.currentTick = await this.readState();

      if (!this.currentTick) {
        try {
          this.currentTick = await fetchLatestTick();
        } catch (error) {
          console.error(`Error fetching latest tick: ${error}`);
          this.currentTick = 0;
        }
      }

      console.info(`Last processed tick: ${this.currentTick}`);

      this.intervalId = setInterval(async () => {
        try {
          const latestTick = await fetchLatestTick();
          console.debug(`Latest tick: ${latestTick}, Current tick: ${this.currentTick}`);

          if (latestTick > this.currentTick) {
            try {
              const tickEvents = await fetchTickEvents(this.currentTick);
              const qxLogs = await decodeQXLog(tickEvents);
              console.info(`Processed logs for tick ${this.currentTick}`);
              console.debug(JSON.stringify(qxLogs));

              // Update state after successful processing
              await this.writeState({ processedTick: this.currentTick });

              this.currentTick++;
            } catch (error) {
              console.error(`Error processing tick ${this.currentTick}: ${error}`);
              // Continue with next interval without incrementing tick to retry
            }
          }
        } catch (error) {
          console.error(`Error in indexer interval: ${error}`);
          // The interval will continue despite errors
        }
      }, 500);

      // Keep the process running
      process.on("uncaughtException", (error) => {
        console.error(`Uncaught exception: ${error}`);
        // Don't exit the process
      });
    } catch (error) {
      console.error(`Fatal error in indexer: ${error}`);
      this.running = false;
      // Restart the indexer after a delay
      setTimeout(() => {
        console.info("Restarting indexer after error...");
        this.start();
      }, 5000);
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.running = false;
    console.info("Indexer stopped");
  }
}

export const indexer = new QXIndexer();

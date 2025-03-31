import { IEvent, TickEvents } from "../types";
import { base64ToUint8Array, getResponseValues } from "../utils";

const CONTRACT_INDEX = 12;

enum EventType {
  QU_TRANSFER = 0,
  ASSET_ISSUANCE = 1,
  ASSET_OWNERSHIP_CHANGE = 2,
  ASSET_POSSESSION_CHANGE = 3,
  CONTRACT_ERROR_MESSAGE = 4,
  CONTRACT_WARNING_MESSAGE = 5,
  CONTRACT_INFORMATION_MESSAGE = 6,
  CONTRACT_DEBUG_MESSAGE = 7,
  BURNING = 8,
  DUST_BURNING = 9,
  SPECTRUM_STATS = 10,
  ASSET_OWNERSHIP_MANAGING_CONTRACT_CHANGE = 11,
  ASSET_POSSESSION_MANAGING_CONTRACT_CHANGE = 12,
  CUSTOM_MESSAGE = 255
}

const checkSCLog = (event: IEvent) => {
  let result = false;
  if (
    event.eventType === EventType.CONTRACT_ERROR_MESSAGE ||
    event.eventType === EventType.CONTRACT_WARNING_MESSAGE ||
    event.eventType === EventType.CONTRACT_INFORMATION_MESSAGE ||
    event.eventType === EventType.CONTRACT_DEBUG_MESSAGE
  ) {
    result = true;
  }
  return result;
};

const decodeLogHeader = (eventData: string) => {
  const eventDataArray = base64ToUint8Array(eventData);
  const dataView = new DataView(eventDataArray.buffer);
  const SCIdx = dataView.getUint32(0, true);
  const eventType = dataView.getUint32(4, true);

  return { contractIdx: SCIdx, logType: eventType };
};

const decodeLogBody = (eventData: string, logType: number) => {
  const values = getResponseValues(eventData);

  const issuer = values?.getID(0);
  const assetName = values?.getUint64(32);
  const price = values?.getUint64(40);
  const numberOfShares = values?.getUint64(48);

  return { issuer, assetName, price, numberOfShares };
};

const decodeQXTradeLog = async (log: TickEvents) => {
  const result: any[] = [];

  for (const tx of log.txEvents) {
    for (const event of tx.events) {
      const isSCLog = checkSCLog(event);
      if (!isSCLog) continue;

      const { contractIdx, logType } = decodeLogHeader(event.eventData);
      if (contractIdx !== CONTRACT_INDEX) continue;

      const eventData = decodeLogBody(event.eventData, logType);

      if (eventData) {
        result.push({
          tick: log.tick,
          eventId: Number(event.header.eventId),
          logType,
          ...eventData
        });
      }
    }
  }

  return result;
};

export { decodeQXTradeLog };

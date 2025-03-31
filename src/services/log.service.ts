import { IEvent, TickEvents } from "../types";
import { base64ToUint8Array, getResponseValues, assetNameDecode } from "../utils";

const CONTRACT_INDEX = 1;

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

const decodeQXTradeLog = async (eventData: string) => {
  const values = getResponseValues(eventData);
  if (!values) return null;

  const issuer = await values.getID(8);
  const assetName = values.getUint64(40);
  const price = values.getUint64(48);
  const amount = values.getUint64(56);

  return {
    issuer,
    assetName: assetNameDecode(assetName),
    price: Number(price),
    amount: Number(amount)
  };
};

const decodeTransferAssetOwnershipLog = async (eventData: string) => {
  const values = getResponseValues(eventData);
  if (!values) return null;

  const fromID = await values.getID(0);
  const toID = await values.getID(32);
  const issuer = await values.getID(64);
  const amount = values.getUint64(96);
  const assetName = values.getUint64(104);
  // const numberOfDecimalPlaces = values.getUint32(112);
  // const unitOfMeasurement = values.getUint64(120);

  return {
    fromID,
    toID,
    issuer,
    assetName: assetNameDecode(assetName),
    amount: Number(amount)
    // numberOfDecimalPlaces,
    // unitOfMeasurement
  };
};

const decodeQXLog = async (log: TickEvents) => {
  const result: any[] = [];

  for (const tx of log.txEvents) {
    for (const event of tx.events) {
      const isSCLog = checkSCLog(event);
      if (!isSCLog) continue;

      const { contractIdx, logType } = decodeLogHeader(event.eventData);
      if (contractIdx !== CONTRACT_INDEX) continue;

      const qxTradeLog = await decodeQXTradeLog(event.eventData);
      // if trade log exist in tx, there is transfer asset ownership log
      const transferAssetOwnershipTxEvent = tx.events.find(
        (event) => event.eventType === EventType.ASSET_POSSESSION_CHANGE
      );
      let transferAssetOwnershipLog = null;
      if (transferAssetOwnershipTxEvent) {
        console.log(transferAssetOwnershipTxEvent.eventData);
        transferAssetOwnershipLog = await decodeTransferAssetOwnershipLog(
          transferAssetOwnershipTxEvent.eventData
        );
      }

      result.push({
        tick: log.tick,
        txHash: tx.txId,
        eventId: Number(event.header.eventId),
        logType,
        ...qxTradeLog,
        ...transferAssetOwnershipLog
      });
    }
  }

  return result;
};

export { decodeQXLog };

import { QubicHelper } from "@qubic-lib/qubic-ts-library/dist/qubicHelper";

const qHelper = new QubicHelper();

export const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
  const binaryString = String.fromCharCode.apply(null, Array.from(uint8Array));
  return btoa(binaryString);
};

export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  return new Uint8Array(binaryString.split("").map((char) => char.charCodeAt(0)));
};

export const getResponseValues = (responseData: string) => {
  if (!responseData) return null;
  const responseArray = base64ToUint8Array(responseData);
  const responseView = new DataView(responseArray.buffer);

  return {
    getUint64: (offset: number) => BigInt(responseView.getBigUint64(offset, true)),
    getUint32: (offset: number) => responseView.getUint32(offset, true),
    getUint8: (offset: number) => responseView.getUint8(offset),
    getID: async (offset: number) =>
      await qHelper.getIdentity(responseArray.slice(offset, offset + 32))
  };
};

export const assetNameConvert = (input: string): bigint => {
  if (input.length > 7) {
    throw new Error("Input string is too long");
  }
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  for (let i = 0; i < Math.min(input.length, 8); i++) {
    view.setUint8(i, input.charCodeAt(i));
  }
  return BigInt(view.getBigUint64(0, true));
};

export const assetNameDecode = (input: bigint): string => {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, input, true);

  let result = "";
  for (let i = 0; i < 8; i++) {
    const charCode = view.getUint8(i);
    if (charCode !== 0) {
      result += String.fromCharCode(charCode);
    }
  }
  return result;
};

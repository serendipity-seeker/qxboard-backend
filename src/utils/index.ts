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
  const responseView = new DataView(base64ToUint8Array(responseData).buffer);
  const responseArray = base64ToUint8Array(responseData);

  return {
    getUint64: (offset: number) => Number(responseView.getBigUint64(offset, true)),
    getUint32: (offset: number) => responseView.getUint32(offset, true),
    getUint8: (offset: number) => responseView.getUint8(offset),
    getID: (offset: number) => qHelper.getIdentity(responseArray.slice(offset, offset + 32))
  };
};

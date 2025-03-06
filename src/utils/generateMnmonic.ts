import { ethers } from "ethers";

export function generateMnemonic() {
  let randomEntropyBytes = ethers.randomBytes(16);
  return ethers.Mnemonic.fromEntropy(randomEntropyBytes);
}

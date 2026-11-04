import * as ed from "@noble/ed25519";

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export function generateEd25519KeyPair(): KeyPair {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = ed.getPublicKey(privateKey);
  return { publicKey, privateKey };
}

export async function signMcpPayload(message: string, privateKey: Uint8Array): Promise<string> {
  const enc = new TextEncoder();
  const sig = await ed.signAsync(enc.encode(message), privateKey);
  return Buffer.from(sig).toString("hex");
}

export async function verifyMcpSignature(
  message: string,
  signatureHex: string,
  publicKey: Uint8Array
): Promise<boolean> {
  const enc = new TextEncoder();
  const sig = Buffer.from(signatureHex, "hex");
  return ed.verifyAsync(sig, enc.encode(message), publicKey);
}
